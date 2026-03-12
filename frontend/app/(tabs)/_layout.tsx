import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_ITEMS = [
  { name: 'index', title: 'Housing', icon: 'home', route: '/' },
  { name: 'food', title: 'Food', icon: 'restaurant', route: '/food' },
  { name: 'saved', title: 'Saved', icon: 'bookmark', route: '/saved' },
  { name: 'info', title: 'Info', icon: 'information-circle', route: '/info' },
];

function TopTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isActive = (route: string, name: string) => {
    if (route === '/' && (pathname === '/' || pathname === '/index')) return true;
    if (route !== '/' && pathname.includes(name)) return true;
    return false;
  };

  return (
    <View style={[styles.topTabBar, { paddingTop: insets.top > 0 ? insets.top + 8 : 12 }]}>
      <Text style={styles.appTitle}>Resource Finder</Text>
      <View style={styles.tabsContainer}>
        {TAB_ITEMS.map((tab) => {
          const active = isActive(tab.route, tab.name);
          return (
            <TouchableOpacity
              key={tab.name}
              style={[styles.tabItem, active && styles.tabItemActive]}
              onPress={() => router.push(tab.route as any)}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={active ? '#fff' : '#94A3B8'}
              />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <TopTabBar />
      <View style={styles.content}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' },
          }}
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="food" />
          <Tabs.Screen name="saved" />
          <Tabs.Screen name="info" />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topTabBar: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: '#3B82F6',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabLabelActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
});
