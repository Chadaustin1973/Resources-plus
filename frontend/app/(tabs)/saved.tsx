import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface SavedResource {
  id: string;
  resource_id: string;
  resource_data: {
    id: string;
    name: string;
    category: string;
    description: string;
    city: string;
    state: string;
    phone?: string;
  };
  saved_at: string;
}

const getCategoryInfo = (category: string) => {
  const categories: Record<string, { color: string; icon: string }> = {
    shelter: { color: '#EF4444', icon: 'home' },
    section8: { color: '#8B5CF6', icon: 'business' },
    free_stay: { color: '#EC4899', icon: 'heart' },
    budget_motel: { color: '#F59E0B', icon: 'bed' },
    transitional: { color: '#10B981', icon: 'trending-up' },
    social_service: { color: '#3B82F6', icon: 'people' },
  };
  return categories[category] || { color: '#64748B', icon: 'help-circle' };
};

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [savedResources, setSavedResources] = useState<SavedResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSavedResources = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/resources/saved`);
      setSavedResources(response.data.saved || []);
    } catch (error) {
      console.error('Error fetching saved resources:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSavedResources();
    }, [])
  );

  const handleRemove = async (resourceId: string) => {
    Alert.alert(
      'Remove Resource',
      'Are you sure you want to remove this from saved?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/api/resources/saved/${resourceId}`);
              setSavedResources(prev => prev.filter(r => r.resource_id !== resourceId));
            } catch (error) {
              Alert.alert('Error', 'Failed to remove resource');
            }
          },
        },
      ]
    );
  };

  const handleResourcePress = (resource: SavedResource) => {
    router.push({
      pathname: '/resource/[id]',
      params: {
        id: resource.resource_id,
        resourceData: JSON.stringify(resource.resource_data),
      },
    });
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchSavedResources();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Resources</Text>
        <Text style={styles.subtitle}>
          {savedResources.length} resource{savedResources.length !== 1 ? 's' : ''} saved
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : savedResources.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={64} color="#64748B" />
          <Text style={styles.emptyTitle}>No Saved Resources</Text>
          <Text style={styles.emptyText}>
            Resources you save will appear here for easy access.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
            />
          }
        >
          {savedResources.map(resource => {
            const categoryInfo = getCategoryInfo(resource.resource_data.category);
            return (
              <TouchableOpacity
                key={resource.id}
                style={styles.resourceCard}
                onPress={() => handleResourcePress(resource)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color }]}>
                    <Ionicons name={categoryInfo.icon as any} size={16} color="#fff" />
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemove(resource.resource_id)}
                  >
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.resourceName}>{resource.resource_data.name}</Text>
                <Text style={styles.resourceLocation}>
                  {resource.resource_data.city}, {resource.resource_data.state}
                </Text>
                <Text style={styles.resourceDescription} numberOfLines={2}>
                  {resource.resource_data.description}
                </Text>
                {resource.resource_data.phone && (
                  <View style={styles.phoneContainer}>
                    <Ionicons name="call" size={14} color="#3B82F6" />
                    <Text style={styles.phoneText}>{resource.resource_data.phone}</Text>
                  </View>
                )}
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
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 20,
    paddingTop: 10,
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
    paddingVertical: 4,
    borderRadius: 12,
  },
  removeButton: {
    padding: 4,
  },
  resourceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  resourceLocation: {
    fontSize: 14,
    color: '#3B82F6',
    marginBottom: 8,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  phoneText: {
    fontSize: 14,
    color: '#3B82F6',
  },
});
