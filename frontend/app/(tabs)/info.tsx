import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const RESOURCES = [
  {
    title: '211 Helpline',
    description: 'Free, confidential service connecting people with local resources',
    phone: '211',
    icon: 'call',
  },
  {
    title: 'HUD Housing Counseling',
    description: 'Find a HUD-approved housing counseling agency',
    phone: '1-800-569-4287',
    icon: 'business',
  },
  {
    title: 'National Homeless Hotline',
    description: '24/7 support for individuals experiencing homelessness',
    phone: '1-800-231-6946',
    icon: 'home',
  },
];

const TIPS = [
  'Contact your local Department of Social Services for emergency housing assistance',
  'Churches and faith-based organizations often provide temporary housing help',
  'Many cities have 2-1-1 services that can connect you with local resources',
  "Check if you qualify for Section 8 housing vouchers through your local housing authority",
  'Salvation Army and Catholic Charities often offer emergency housing assistance',
];

export default function InfoScreen() {
  const insets = useSafeAreaInsets();

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/[^0-9]/g, '')}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Housing Resources</Text>
          <Text style={styles.subtitle}>Helpful information and emergency contacts</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Hotlines</Text>
          {RESOURCES.map((resource, index) => (
            <View key={index} style={styles.resourceCard}>
              <View style={styles.resourceIcon}>
                <Ionicons name={resource.icon as any} size={24} color="#3B82F6" />
              </View>
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>{resource.title}</Text>
                <Text style={styles.resourceDescription}>{resource.description}</Text>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => handleCall(resource.phone)}
                >
                  <Ionicons name="call" size={16} color="#fff" />
                  <Text style={styles.callButtonText}>{resource.phone}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips for Finding Housing</Text>
          {TIPS.map((tip, index) => (
            <View key={index} style={styles.tipCard}>
              <View style={styles.tipNumber}>
                <Text style={styles.tipNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This App</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              Housing Finder uses AI-powered search to help locate free and low-cost housing resources in your area. We search through databases of shelters, Section 8 housing, community programs, and more to provide you with relevant options.
            </Text>
            <Text style={styles.aboutNote}>
              Note: While we strive to provide accurate information, please verify details directly with each organization as availability and requirements may change.
            </Text>
          </View>
        </View>

        <View style={styles.disclaimerCard}>
          <Ionicons name="alert-circle" size={24} color="#F59E0B" />
          <Text style={styles.disclaimerText}>
            This app provides information only and does not guarantee housing availability. Always contact resources directly to confirm current availability and eligibility requirements.
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
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
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  resourceCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1E3A5F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
    lineHeight: 20,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 22,
  },
  aboutCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  aboutText: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 22,
    marginBottom: 16,
  },
  aboutNote: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#422006',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#713F12',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: '#FCD34D',
    lineHeight: 20,
  },
});
