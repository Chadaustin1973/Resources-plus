from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Define Models
class Resource(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    resource_type: str = "housing"  # housing or food
    description: str
    address: Optional[str] = None
    city: str
    state: str
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    eligibility: Optional[str] = None
    services: List[str] = []
    hours: Optional[str] = None
    notes: Optional[str] = None
    source: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Keep HousingResource as alias for backward compatibility
HousingResource = Resource

class SavedResource(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    resource_id: str
    resource_data: dict
    saved_at: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = None

class SearchRequest(BaseModel):
    location: str  # City, State or Zip code
    categories: List[str] = []  # Empty means all categories
    specific_needs: Optional[str] = None
    resource_type: str = "housing"  # housing or food

class SearchResponse(BaseModel):
    resources: List[Resource]
    search_summary: str
    total_found: int

# Housing categories
HOUSING_CATEGORIES = [
    {"id": "shelter", "name": "Emergency Shelters", "icon": "home", "description": "Immediate temporary housing for those in crisis"},
    {"id": "section8", "name": "Section 8 / HUD", "icon": "building", "description": "Government housing vouchers and subsidized housing"},
    {"id": "free_stay", "name": "Free Temporary Stays", "icon": "heart", "description": "Churches, community programs, and charitable organizations"},
    {"id": "budget_motel", "name": "Budget Motels", "icon": "bed", "description": "Low-cost and no credit card required accommodations"},
    {"id": "transitional", "name": "Transitional Housing", "icon": "trending-up", "description": "Longer-term housing with support services"},
    {"id": "social_service", "name": "Social Services", "icon": "users", "description": "Organizations that help find housing assistance"},
]

# Food categories
FOOD_CATEGORIES = [
    {"id": "food_pantry", "name": "Food Pantries", "icon": "basket", "description": "Free groceries and food boxes to take home"},
    {"id": "soup_kitchen", "name": "Soup Kitchens & Free Meals", "icon": "restaurant", "description": "Hot meals served on-site at no cost"},
    {"id": "food_bank", "name": "Food Banks & Distribution", "icon": "cube", "description": "Large-scale food distribution centers"},
    {"id": "church_meals", "name": "Church & Community Meals", "icon": "people", "description": "Free dinners and meals at churches and community centers"},
    {"id": "snap_wic", "name": "SNAP & WIC Programs", "icon": "card", "description": "Government food assistance programs"},
    {"id": "free_groceries", "name": "Free Grocery Programs", "icon": "cart", "description": "Mobile pantries, produce distributions, and food rescue"},
    {"id": "coupons_deals", "name": "Coupons & Free Deals", "icon": "pricetag", "description": "Free food coupons, samples, and grocery store deals"},
    {"id": "student_senior", "name": "Student & Senior Programs", "icon": "school", "description": "Free meals for students, seniors, and special populations"},
]

# Combined for backward compatibility
CATEGORIES = HOUSING_CATEGORIES

# AI Research function
async def research_housing_resources(location: str, categories: List[str], specific_needs: Optional[str] = None) -> List[dict]:
    """Use AI to research and find housing resources for the given location."""
    
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        logger.error("EMERGENT_LLM_KEY not found")
        return []
    
    category_names = ", ".join([c["name"] for c in CATEGORIES if not categories or c["id"] in categories]) or "all housing types"
    
    system_message = """You are a housing resource research assistant specializing in finding free and low-cost housing options for low-income individuals and families. You have extensive knowledge of:
- Emergency shelters and homeless services
- Section 8 and HUD housing programs
- Church and faith-based temporary housing programs
- Community assistance programs
- Budget motels that accept cash or don't require credit cards
- Transitional housing programs
- Social service agencies

Your job is to provide detailed, actionable information about housing resources in specific locations. Always provide realistic, helpful information based on typical resources available in the area."""

    user_prompt = f"""Research and find housing resources for someone in need in {location}. 

Focus on these categories: {category_names}
{f"Additional needs: {specific_needs}" if specific_needs else ""}

Provide a comprehensive list of at least 5-8 housing resources. For each resource, provide:
1. Name of the organization/resource
2. Category (shelter, section8, free_stay, budget_motel, transitional, or social_service)
3. Detailed description of services
4. Full address if known
5. Phone number if available
6. Website if available
7. Eligibility requirements
8. Services offered (as a list)
9. Operating hours if known
10. Any important notes

IMPORTANT: Return your response as a valid JSON array of objects. Each object should have these exact fields:
- name (string)
- category (string: one of shelter, section8, free_stay, budget_motel, transitional, social_service)
- description (string)
- address (string or null)
- city (string)
- state (string)
- zip_code (string or null)
- phone (string or null)
- website (string or null)
- eligibility (string or null)
- services (array of strings)
- hours (string or null)
- notes (string or null)
- source (string describing where this info might be found)

Return ONLY the JSON array, no other text."""

    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=f"housing-search-{uuid.uuid4()}",
            system_message=system_message
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=user_prompt)
        response = await chat.send_message(user_message)
        
        # Parse the JSON response
        # Clean the response - remove markdown code blocks if present
        cleaned_response = response.strip()
        if cleaned_response.startswith("```json"):
            cleaned_response = cleaned_response[7:]
        if cleaned_response.startswith("```"):
            cleaned_response = cleaned_response[3:]
        if cleaned_response.endswith("```"):
            cleaned_response = cleaned_response[:-3]
        cleaned_response = cleaned_response.strip()
        
        resources = json.loads(cleaned_response)
        return resources
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI response as JSON: {e}")
        logger.error(f"Response was: {response[:500] if response else 'None'}")
        return []
    except Exception as e:
        logger.error(f"Error in AI research: {e}")
        return []

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Housing Finder API", "version": "1.0"}

@api_router.get("/categories")
async def get_categories():
    """Get all housing categories."""
    return {"categories": CATEGORIES}

@api_router.post("/search", response_model=SearchResponse)
async def search_housing(request: SearchRequest):
    """Search for housing resources using AI-powered research."""
    logger.info(f"Searching for housing in: {request.location}")
    
    # Perform AI research
    raw_resources = await research_housing_resources(
        location=request.location,
        categories=request.categories,
        specific_needs=request.specific_needs
    )
    
    # Convert to HousingResource objects and store in database
    resources = []
    for r in raw_resources:
        try:
            resource = HousingResource(
                name=r.get("name", "Unknown Resource"),
                category=r.get("category", "social_service"),
                description=r.get("description", ""),
                address=r.get("address"),
                city=r.get("city", request.location.split(",")[0].strip()),
                state=r.get("state", request.location.split(",")[-1].strip() if "," in request.location else ""),
                zip_code=r.get("zip_code"),
                phone=r.get("phone"),
                website=r.get("website"),
                eligibility=r.get("eligibility"),
                services=r.get("services", []),
                hours=r.get("hours"),
                notes=r.get("notes"),
                source=r.get("source")
            )
            resources.append(resource)
            
            # Store in database for caching
            await db.housing_resources.update_one(
                {"name": resource.name, "city": resource.city},
                {"$set": resource.dict()},
                upsert=True
            )
        except Exception as e:
            logger.error(f"Error processing resource: {e}")
            continue
    
    # Store search in history
    await db.search_history.insert_one({
        "location": request.location,
        "categories": request.categories,
        "specific_needs": request.specific_needs,
        "results_count": len(resources),
        "timestamp": datetime.utcnow()
    })
    
    summary = f"Found {len(resources)} housing resources in {request.location}"
    if request.categories:
        cat_names = [c["name"] for c in CATEGORIES if c["id"] in request.categories]
        summary += f" focusing on: {', '.join(cat_names)}"
    
    return SearchResponse(
        resources=resources,
        search_summary=summary,
        total_found=len(resources)
    )

@api_router.get("/resources")
async def get_resources(city: Optional[str] = None, category: Optional[str] = None):
    """Get cached housing resources."""
    query = {}
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    if category:
        query["category"] = category
    
    resources = await db.housing_resources.find(query).to_list(100)
    return {"resources": [HousingResource(**r) for r in resources]}

@api_router.post("/resources/save")
async def save_resource(resource_data: dict):
    """Save a resource to favorites."""
    saved = SavedResource(
        resource_id=resource_data.get("id", str(uuid.uuid4())),
        resource_data=resource_data
    )
    
    # Check if already saved
    existing = await db.saved_resources.find_one({"resource_id": saved.resource_id})
    if existing:
        return {"message": "Resource already saved", "saved": SavedResource(**existing)}
    
    await db.saved_resources.insert_one(saved.dict())
    return {"message": "Resource saved", "saved": saved}

@api_router.get("/resources/saved")
async def get_saved_resources():
    """Get all saved resources."""
    saved = await db.saved_resources.find().sort("saved_at", -1).to_list(100)
    return {"saved": [SavedResource(**s) for s in saved]}

@api_router.delete("/resources/saved/{resource_id}")
async def delete_saved_resource(resource_id: str):
    """Remove a saved resource."""
    result = await db.saved_resources.delete_one({"resource_id": resource_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Saved resource not found")
    return {"message": "Resource removed from saved"}

@api_router.get("/search/history")
async def get_search_history():
    """Get recent search history."""
    history = await db.search_history.find().sort("timestamp", -1).to_list(20)
    return {"history": history}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
