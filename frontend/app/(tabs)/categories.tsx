import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const CATEGORIES = [
  {
    id: 'shelter',
    name: 'Emergency Shelters',
    icon: 'home',
    description: 'Immediate temporary housing for those in crisis. Typically provides beds, meals, and basic necessities.',
    color: '#EF4444',
  },
  {
    id: 'section8',
    name: 'Section 8 / HUD Housing',
    icon: 'business',
    description: 'Government housing vouchers and subsidized housing programs. Long-term affordable housing solutions.',
    color: '#8B5CF6',
  },
  {
    id: 'free_stay',
    name: 'Free Temporary Stays',
    icon: 'heart',
    description: 'Churches, community programs, and charitable organizations offering free short-term housing.',
    color: '#EC4899',
  },
  {
    id: 'budget_motel',
    name: 'Budget Motels',
    icon: 'bed',
    description: 'Low-cost accommodations that may accept cash, weekly rates, or not require credit cards.',
    color: '#F59E0B',
  },
  {
    id: 'transitional',
    name: 'Transitional Housing',
    icon: 'trending-up',
    description: 'Longer-term housing with support services to help transition to permanent housing.',
    color: '#10B981',
  },
  {
    id: 'social_service',
    name: 'Social Services',
    icon: 'people',
    description: 'Organizations that help navigate housing assistance programs and provide resources.',
    color: '#3B82F6',
  },
];

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    router.push({
      pathname: '/(tabs)',
      params: { selectedCategory: categoryId },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Housing Categories</Text>
        <Text style={styles.subtitle}>Explore different types of housing assistance</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => handleCategoryPress(category.id, category.name)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
              <Ionicons name={category.icon as any} size={28} color="#fff" />
            </View>
            <View style={styles.categoryContent}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#64748B" />
          </TouchableOpacity>
        ))}

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <Text style={styles.infoText}>
            Tap a category to search for that specific type of housing assistance in your area.
          </Text>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
    gap: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryContent: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#93C5FD',
    lineHeight: 20,
  },
});
