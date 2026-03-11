import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0F172A' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="resource/[id]"
            options={{
              headerShown: true,
              headerTitle: 'Resource Details',
              headerStyle: { backgroundColor: '#1E293B' },
              headerTintColor: '#fff',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="search-results"
            options={{
              headerShown: true,
              headerTitle: 'Search Results',
              headerStyle: { backgroundColor: '#1E293B' },
              headerTintColor: '#fff',
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
