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

const EMERGENCY_RESOURCES = [
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
  {
    title: 'SNAP Hotline',
    description: 'Food assistance program information',
    phone: '1-800-221-5689',
    icon: 'restaurant',
  },
];

const TIPS = [
  'Contact your local Department of Social Services for emergency assistance',
  'Churches and faith-based organizations often provide free meals and food pantries',
  'Many cities have 2-1-1 services that connect you with local resources',
  "Check if you qualify for Section 8 housing vouchers",
  'Food banks typically don\'t require proof of income',
  'SNAP benefits can be applied for online in most states',
];

export default function InfoScreen() {
  const insets = useSafeAreaInsets();

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/[^0-9]/g, '')}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Resources & Info</Text>
          <Text style={styles.subtitle}>Emergency contacts and helpful tips</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Hotlines</Text>
          {EMERGENCY_RESOURCES.map((resource, index) => (
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
          <Text style={styles.sectionTitle}>Tips for Finding Help</Text>
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
              Resource Finder uses AI-powered search to help locate free housing and food resources in your area. We search through databases of shelters, food pantries, Section 8 housing, community programs, and more.
            </Text>
            <Text style={styles.aboutNote}>
              Note: Always verify details directly with each organization as availability and requirements may change.
            </Text>
          </View>
        </View>

        <View style={styles.disclaimerCard}>
          <Ionicons name="alert-circle" size={24} color="#F59E0B" />
          <Text style={styles.disclaimerText}>
            This app provides information only and does not guarantee resource availability. Always contact resources directly to confirm.
          </Text>
        </View>

        <View style={styles.legalSection}>
          <Text style={styles.legalTitle}>Legal Information</Text>
          
          <View style={styles.legalCard}>
            <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
            <View style={styles.legalContent}>
              <Text style={styles.legalHeading}>Copyright Notice</Text>
              <Text style={styles.legalText}>
                Copyright 2025 Chad Alan Austin. All Rights Reserved.
              </Text>
            </View>
          </View>

          <View style={styles.legalCard}>
            <Ionicons name="document-text" size={20} color="#8B5CF6" />
            <View style={styles.legalContent}>
              <Text style={styles.legalHeading}>Intellectual Property</Text>
              <Text style={styles.legalText}>
                This application, including all code, design, algorithms, and content, is the intellectual property of Chad Alan Austin. No reproduction, modification, or commercial use without written permission.
              </Text>
            </View>
          </View>

          <View style={styles.legalCard}>
            <Ionicons name="information-circle" size={20} color="#10B981" />
            <View style={styles.legalContent}>
              <Text style={styles.legalHeading}>Disclosures</Text>
              <Text style={styles.legalText}>
                {"\u2022"} Information provided for informational purposes only{"\n"}
                {"\u2022"} Some content is AI-generated and should be verified{"\n"}
                {"\u2022"} Listing does not constitute endorsement{"\n"}
                {"\u2022"} Not legal, financial, or professional advice{"\n"}
                {"\u2022"} Resource availability subject to change
              </Text>
            </View>
          </View>

          <View style={styles.legalCard}>
            <Ionicons name="lock-closed" size={20} color="#EC4899" />
            <View style={styles.legalContent}>
              <Text style={styles.legalHeading}>Privacy</Text>
              <Text style={styles.legalText}>
                We collect minimal data necessary to provide services. Location data is used only for resource searches and is not stored permanently.
              </Text>
            </View>
          </View>

          <View style={styles.legalCard}>
            <Ionicons name="hand-left" size={20} color="#F59E0B" />
            <View style={styles.legalContent}>
              <Text style={styles.legalHeading}>Limitation of Liability</Text>
              <Text style={styles.legalText}>
                Chad Alan Austin shall not be liable for any direct, indirect, incidental, or consequential damages arising from use of this application.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.copyrightFooter}>
          <Text style={styles.copyrightText}>
            2025 Chad Alan Austin{"\n"}
            All Rights Reserved
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
    marginBottom: 28,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: '#FCD34D',
    lineHeight: 20,
  },
  legalSection: {
    marginBottom: 20,
  },
  legalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  legalCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  legalContent: {
    flex: 1,
  },
  legalHeading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  legalText: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 20,
  },
  copyrightFooter: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  copyrightText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
});
