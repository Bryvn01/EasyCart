/**
 * App Navigator
 *
 * Root navigator with conditional rendering based on authentication state.
 * Handles the switch between Auth and Main navigators, plus modal screens.
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import type { RootStackParamList } from './types';
import { useAuthStore } from '@/store/authStore';
import { theme } from '@/theme';

// Navigators
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

// Modal screens (accessible from anywhere)
// import ProductDetailModal from '@/screens/modals/ProductDetailModal';
// import ImageViewer from '@/screens/modals/ImageViewer';
// import WebViewModal from '@/screens/modals/WebViewModal';
// import QRScannerModal from '@/screens/modals/QRScannerModal';

// Placeholder for modal screens
const PlaceholderModal = ({ title }: { title: string }) => (
  <View style={styles.modalPlaceholder}>
    <Text variant="headlineMedium">{title}</Text>
  </View>
);

const ProductDetailModal = () => <PlaceholderModal title="Product Detail Modal" />;
const ImageViewer = () => <PlaceholderModal title="Image Viewer" />;
const WebViewModal = () => <PlaceholderModal title="WebView" />;
const QRScannerModal = () => <PlaceholderModal title="QR Scanner" />;

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Loading screen shown during initialization
 */
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

/**
 * Main App Navigator
 */
export default function AppNavigator() {
  const { isInitialized, user, initialize } = useAuthStore();

  // Initialize auth state on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading screen until initialization is complete
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  const isAuthenticated = !!user;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {/* Conditional rendering based on auth state */}
        {!isAuthenticated ? (
          // Not authenticated - show Auth stack
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{
              animationTypeForReplace: 'pop', // Smooth transition on logout
            }}
          />
        ) : (
          // Authenticated - show Main stack
          <Stack.Screen
            name="Main"
            component={MainNavigator}
            options={{
              animationTypeForReplace: 'push', // Smooth transition on login
            }}
          />
        )}

        {/* Modal screens accessible from anywhere */}
        <Stack.Group
          screenOptions={{
            presentation: 'modal',
            headerShown: true,
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerTintColor: theme.colors.onBackground,
            headerTitleStyle: {
              fontFamily: theme.typography.titleLarge.fontFamily,
              fontSize: theme.typography.titleLarge.fontSize,
              fontWeight: theme.typography.titleLarge.fontWeight,
            },
          }}
        >
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailModal}
            options={{ headerTitle: 'Product Details' }}
          />

          <Stack.Screen
            name="ImageViewer"
            component={ImageViewer}
            options={{
              headerShown: false,
              presentation: 'fullScreenModal',
            }}
          />

          <Stack.Screen
            name="WebView"
            component={WebViewModal}
            options={({ route }) => ({
              headerTitle: route.params?.title || 'Browser',
            })}
          />

          <Stack.Screen
            name="QRScanner"
            component={QRScannerModal}
            options={{
              headerTitle: 'Scan QR Code',
              presentation: 'fullScreenModal',
            }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.onBackground,
    ...theme.typography.bodyLarge,
  },
  modalPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
});
