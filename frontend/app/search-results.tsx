import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface HousingResource {
  id: string;
  name: string;
  category: string;
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

const getCategoryInfo = (category: string) => {
  const categories: Record<string, { color: string; icon: string; name: string }> = {
    shelter: { color: '#EF4444', icon: 'home', name: 'Emergency Shelter' },
    section8: { color: '#8B5CF6', icon: 'business', name: 'Section 8 / HUD' },
    free_stay: { color: '#EC4899', icon: 'heart', name: 'Free Stay' },
    budget_motel: { color: '#F59E0B', icon: 'bed', name: 'Budget Motel' },
    transitional: { color: '#10B981', icon: 'trending-up', name: 'Transitional' },
    social_service: { color: '#3B82F6', icon: 'people', name: 'Social Service' },
  };
  return categories[category] || { color: '#64748B', icon: 'help-circle', name: 'Other' };
};

export default function SearchResultsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const resultsData = params.results ? JSON.parse(params.results as string) : null;
  const resources: HousingResource[] = resultsData?.resources || [];
  const searchSummary = resultsData?.search_summary || '';
  const searchLocation = params.searchLocation as string || '';

  const handleSaveResource = async (resource: HousingResource) => {
    if (savedIds.has(resource.id)) {
      Alert.alert('Already Saved', 'This resource is already in your saved list.');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/resources/save`, resource);
      setSavedIds(prev => new Set([...prev, resource.id]));
      Alert.alert('Saved', 'Resource saved to your list!');
    } catch (error) {
      console.error('Error saving resource:', error);
      Alert.alert('Error', 'Failed to save resource. Please try again.');
    }
  };

  const handleResourcePress = (resource: HousingResource) => {
    router.push({
      pathname: '/resource/[id]',
      params: {
        id: resource.id,
        resourceData: JSON.stringify(resource),
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.summaryBar}>
        <Ionicons name="location" size={18} color="#3B82F6" />
        <Text style={styles.summaryText}>{searchSummary}</Text>
      </View>

      {resources.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#64748B" />
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptyText}>
            We couldn't find housing resources for this location. Try a different search.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {resources.map((resource, index) => {
            const categoryInfo = getCategoryInfo(resource.category);
            const isSaved = savedIds.has(resource.id);

            return (
              <TouchableOpacity
                key={resource.id || index}
                style={styles.resourceCard}
                onPress={() => handleResourcePress(resource)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color }]}>
                    <Ionicons name={categoryInfo.icon as any} size={14} color="#fff" />
                    <Text style={styles.categoryText}>{categoryInfo.name}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => handleSaveResource(resource)}
                  >
                    <Ionicons
                      name={isSaved ? 'bookmark' : 'bookmark-outline'}
                      size={24}
                      color={isSaved ? '#3B82F6' : '#64748B'}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.resourceName}>{resource.name}</Text>

                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color="#3B82F6" />
                  <Text style={styles.locationText}>
                    {resource.address ? `${resource.address}, ` : ''}
                    {resource.city}, {resource.state} {resource.zip_code || ''}
                  </Text>
                </View>

                <Text style={styles.resourceDescription} numberOfLines={3}>
                  {resource.description}
                </Text>

                {resource.phone && (
                  <View style={styles.contactRow}>
                    <Ionicons name="call-outline" size={14} color="#10B981" />
                    <Text style={styles.contactText}>{resource.phone}</Text>
                  </View>
                )}

                {resource.services && resource.services.length > 0 && (
                  <View style={styles.servicesRow}>
                    {resource.services.slice(0, 3).map((service, i) => (
                      <View key={i} style={styles.serviceTag}>
                        <Text style={styles.serviceTagText}>{service}</Text>
                      </View>
                    ))}
                    {resource.services.length > 3 && (
                      <Text style={styles.moreServices}>+{resource.services.length - 3} more</Text>
                    )}
                  </View>
                )}

                <View style={styles.viewMoreRow}>
                  <Text style={styles.viewMoreText}>View Details</Text>
                  <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 14,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  summaryText: {
    flex: 1,
    fontSize: 14,
    color: '#E2E8F0',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  resourceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  saveButton: {
    padding: 4,
  },
  resourceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 6,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: '#3B82F6',
  },
  resourceDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#10B981',
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  serviceTag: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  serviceTagText: {
    fontSize: 12,
    color: '#E2E8F0',
  },
  moreServices: {
    fontSize: 12,
    color: '#64748B',
    alignSelf: 'center',
  },
  viewMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  viewMoreText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
});
