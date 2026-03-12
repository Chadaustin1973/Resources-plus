import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

const CATEGORIES = [
  { id: 'shelter', name: 'Emergency Shelters', icon: 'home' },
  { id: 'section8', name: 'Section 8 / HUD', icon: 'business' },
  { id: 'free_stay', name: 'Free Stays', icon: 'heart' },
  { id: 'budget_motel', name: 'Budget Motels', icon: 'bed' },
  { id: 'transitional', name: 'Transitional', icon: 'trending-up' },
  { id: 'social_service', name: 'Social Services', icon: 'people' },
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [specificNeeds, setSpecificNeeds] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location access to use this feature.');
        return;
      }

      const locationResult = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      });

      if (address) {
        const locationString = `${address.city || address.subregion || ''}, ${address.region || ''}`;
        setLocation(locationString.trim());
      }
    } catch (error) {
      Alert.alert('Error', 'Could not get your location. Please enter it manually.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSearch = async () => {
    if (!location.trim()) {
      Alert.alert('Location Required', 'Please enter a location to search.');
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/search`, {
        location: location.trim(),
        categories: selectedCategories,
        specific_needs: specificNeeds.trim() || null,
      });

      router.push({
        pathname: '/search-results',
        params: {
          results: JSON.stringify(response.data),
          searchLocation: location,
        },
      });
    } catch (error: any) {
      console.error('Search error:', error);
      Alert.alert(
        'Search Failed',
        error.response?.data?.detail || 'An error occurred while searching. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Ionicons name="home" size={40} color="#3B82F6" />
          <Text style={styles.title}>Housing Finder</Text>
          <Text style={styles.subtitle}>
            Find free & low-cost housing resources in your area
          </Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.locationInputContainer}>
            <TextInput
              style={styles.locationInput}
              placeholder="Enter city, state or zip code"
              placeholderTextColor="#64748B"
              value={location}
              onChangeText={setLocation}
            />
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="locate" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Categories (select one or more)</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategories.includes(category.id) && styles.categoryChipSelected,
                ]}
                onPress={() => toggleCategory(category.id)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={18}
                  color={selectedCategories.includes(category.id) ? '#fff' : '#94A3B8'}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategories.includes(category.id) && styles.categoryChipTextSelected,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Specific Needs (optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="E.g., family with children, veterans, disability accessible..."
            placeholderTextColor="#64748B"
            value={specificNeeds}
            onChangeText={setSpecificNeeds}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.searchButtonText}>Searching...</Text>
            </>
          ) : (
            <>
              <Ionicons name="search" size={24} color="#fff" />
              <Text style={styles.searchButtonText}>Find Housing Resources</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.infoText}>
          Our AI will search for shelters, Section 8 housing, free stays, budget motels, and more in your area.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 10,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
  },
  locationButton: {
    backgroundColor: '#3B82F6',
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  categoryChipSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryChipText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  textArea: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 100,
  },
  searchButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 10,
    marginTop: 10,
  },
  searchButtonDisabled: {
    backgroundColor: '#1E40AF',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
  },
});
