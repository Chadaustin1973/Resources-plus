import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface Resource {
  id: string;
  name: string;
  category: string;
  resource_type?: string;
  description: string;
  address?: string;
  city: string;
  state: string;
  zip_code?: string;
  phone?: string;
  website?: string;
  eligibility?: string;
  services: string[];
  hours?: string;
  notes?: string;
  source?: string;
}

const getHousingCategoryInfo = (category: string) => {
  const categories: Record<string, { color: string; icon: string; name: string }> = {
    shelter: { color: '#EF4444', icon: 'home', name: 'Emergency Shelter' },
    section8: { color: '#8B5CF6', icon: 'business', name: 'Section 8 / HUD' },
    free_stay: { color: '#EC4899', icon: 'heart', name: 'Free Stay' },
    budget_motel: { color: '#F59E0B', icon: 'bed', name: 'Budget Motel' },
    transitional: { color: '#10B981', icon: 'trending-up', name: 'Transitional Housing' },
    social_service: { color: '#3B82F6', icon: 'people', name: 'Social Service' },
  };
  return categories[category] || { color: '#64748B', icon: 'help-circle', name: 'Other' };
};

const getFoodCategoryInfo = (category: string) => {
  const categories: Record<string, { color: string; icon: string; name: string }> = {
    food_pantry: { color: '#10B981', icon: 'basket', name: 'Food Pantry' },
    soup_kitchen: { color: '#F59E0B', icon: 'restaurant', name: 'Free Meals' },
    food_bank: { color: '#8B5CF6', icon: 'cube', name: 'Food Bank' },
    church_meals: { color: '#EC4899', icon: 'people', name: 'Church Meals' },
    snap_wic: { color: '#3B82F6', icon: 'card', name: 'SNAP/WIC' },
    free_groceries: { color: '#14B8A6', icon: 'cart', name: 'Free Groceries' },
    coupons_deals: { color: '#EF4444', icon: 'pricetag', name: 'Coupons & Deals' },
    student_senior: { color: '#6366F1', icon: 'school', name: 'Student/Senior' },
  };
  return categories[category] || { color: '#64748B', icon: 'help-circle', name: 'Other' };
};

export default function ResourceDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSaved, setIsSaved] = useState(false);

  const resource: Resource = params.resourceData
    ? JSON.parse(params.resourceData as string)
    : null;
  const resourceType = params.resourceType as string || 'housing';

  if (!resource) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Resource not found</Text>
      </View>
    );
  }

  const categoryInfo = resourceType === 'food' 
    ? getFoodCategoryInfo(resource.category)
    : getHousingCategoryInfo(resource.category);

  const themeColor = resourceType === 'food' ? '#10B981' : '#3B82F6';

  const handleCall = () => {
    if (resource.phone) {
      Linking.openURL(`tel:${resource.phone.replace(/[^0-9]/g, '')}`);
    }
  };

  const handleWebsite = () => {
    if (resource.website) {
      let url = resource.website;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      Linking.openURL(url);
    }
  };

  const handleGetDirections = () => {
    const address = `${resource.address || ''} ${resource.city}, ${resource.state} ${resource.zip_code || ''}`;
    const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const handleSave = async () => {
    try {
      await axios.post(`${API_URL}/api/resources/save`, resource);
      setIsSaved(true);
      Alert.alert('Saved', 'Resource has been saved to your list!');
    } catch (error) {
      console.error('Error saving:', error);
      Alert.alert('Error', 'Could not save resource. Please try again.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
    >
      <View style={[styles.categoryHeader, { backgroundColor: categoryInfo.color }]}>
        <Ionicons name={categoryInfo.icon as any} size={32} color="#fff" />
        <Text style={styles.categoryName}>{categoryInfo.name}</Text>
      </View>

      <View style={styles.mainContent}>
        <Text style={styles.resourceName}>{resource.name}</Text>

        <View style={styles.actionButtons}>
          {resource.phone && (
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
          )}
          {resource.website && (
            <TouchableOpacity style={[styles.actionButton, styles.websiteButton]} onPress={handleWebsite}>
              <Ionicons name="globe" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Website</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: themeColor }]} onPress={handleGetDirections}>
            <Ionicons name="navigate" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Directions</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSaved && { backgroundColor: themeColor, borderColor: themeColor }]}
          onPress={handleSave}
          disabled={isSaved}
        >
          <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={20} color="#fff" />
          <Text style={styles.saveButtonText}>{isSaved ? 'Saved' : 'Save to My List'}</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color={themeColor} />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <Text style={styles.sectionContent}>
            {resource.address && `${resource.address}\n`}
            {resource.city}, {resource.state} {resource.zip_code || ''}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={20} color={themeColor} />
            <Text style={styles.sectionTitle}>Description</Text>
          </View>
          <Text style={styles.sectionContent}>{resource.description}</Text>
        </View>

        {resource.hours && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Hours</Text>
            </View>
            <Text style={styles.sectionContent}>{resource.hours}</Text>
          </View>
        )}

        {resource.phone && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="call" size={20} color="#10B981" />
              <Text style={styles.sectionTitle}>Contact</Text>
            </View>
            <TouchableOpacity onPress={handleCall}>
              <Text style={styles.linkText}>{resource.phone}</Text>
            </TouchableOpacity>
          </View>
        )}

        {resource.website && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="globe" size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Website</Text>
            </View>
            <TouchableOpacity onPress={handleWebsite}>
              <Text style={styles.linkText}>{resource.website}</Text>
            </TouchableOpacity>
          </View>
        )}

        {resource.eligibility && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.sectionTitle}>Eligibility</Text>
            </View>
            <Text style={styles.sectionContent}>{resource.eligibility}</Text>
          </View>
        )}

        {resource.services && resource.services.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="list" size={20} color="#EC4899" />
              <Text style={styles.sectionTitle}>{resourceType === 'food' ? 'What\'s Available' : 'Services Offered'}</Text>
            </View>
            <View style={styles.servicesList}>
              {resource.services.map((service, index) => (
                <View key={index} style={styles.serviceItem}>
                  <Ionicons name="checkmark" size={16} color="#10B981" />
                  <Text style={styles.serviceText}>{service}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {resource.notes && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color="#64748B" />
              <Text style={styles.sectionTitle}>Additional Notes</Text>
            </View>
            <Text style={styles.sectionContent}>{resource.notes}</Text>
          </View>
        )}

        {resource.source && (
          <View style={styles.sourceCard}>
            <Ionicons name="information-circle-outline" size={16} color="#64748B" />
            <Text style={styles.sourceText}>Source: {resource.source}</Text>
          </View>
        )}

        <View style={styles.copyrightFooter}>
          <Text style={styles.copyrightText}>2025 Chad Alan Austin. All Rights Reserved.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#94A3B8',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  mainContent: {
    padding: 20,
  },
  resourceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  websiteButton: {
    backgroundColor: '#8B5CF6',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    marginBottom: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  sectionContent: {
    fontSize: 15,
    color: '#E2E8F0',
    lineHeight: 22,
  },
  linkText: {
    fontSize: 15,
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  servicesList: {
    gap: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceText: {
    fontSize: 14,
    color: '#E2E8F0',
    flex: 1,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginTop: 8,
  },
  sourceText: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  copyrightFooter: {
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  copyrightText: {
    fontSize: 12,
    color: '#64748B',
  },
});
