/**
 * Auth Navigator
 *
 * Stack navigator for authentication flows including:
 * - Login/Register
 * - OTP verification
 * - Password reset
 * - Biometric setup
 * - 2FA setup (for admin users)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types';
import { theme } from '@/theme';

// Screen imports
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';

// Placeholder components (remove when actual screens are implemented)
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

const PlaceholderScreen = ({ title, navigation }: any) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{title}</Text>
    <Button mode="contained" onPress={() => navigation.goBack()}>
      Go Back
    </Button>
  </View>
);
const ForgotPasswordScreen = ({ navigation }: any) => (
  <PlaceholderScreen title="Forgot Password Screen" navigation={navigation} />
);
const ResetPasswordScreen = ({ navigation }: any) => (
  <PlaceholderScreen title="Reset Password Screen" navigation={navigation} />
);
const OTPRequestScreen = ({ navigation }: any) => (
  <PlaceholderScreen title="OTP Request Screen" navigation={navigation} />
);
const OTPVerifyScreen = ({ navigation }: any) => (
  <PlaceholderScreen title="OTP Verify Screen" navigation={navigation} />
);
const BiometricSetupScreen = ({ navigation }: any) => (
  <PlaceholderScreen title="Biometric Setup Screen" navigation={navigation} />
);
const TwoFactorSetupScreen = ({ navigation }: any) => (
  <PlaceholderScreen title="2FA Setup Screen" navigation={navigation} />
);
const TwoFactorVerifyScreen = ({ navigation }: any) => (
  <PlaceholderScreen title="2FA Verify Screen" navigation={navigation} />
);

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Default screen options for auth stack
 */
const screenOptions = {
  headerStyle: {
    backgroundColor: theme.colors.background,
  },
  headerTintColor: theme.colors.onBackground,
  headerTitleStyle: {
    fontFamily: theme.typography.titleLarge.fontFamily,
    fontSize: theme.typography.titleLarge.fontSize,
    fontWeight: theme.typography.titleLarge.fontWeight,
  },
  headerShadowVisible: false,
  animation: 'slide_from_right' as const,
};

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={screenOptions}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false, // Login screen typically has no header
        }}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerTitle: 'Create Account',
          headerBackTitle: 'Back',
        }}
      />

      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          headerTitle: 'Reset Password',
          headerBackTitle: 'Back',
        }}
      />

      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          headerTitle: 'Set New Password',
          headerBackTitle: 'Back',
        }}
      />

      <Stack.Screen
        name="OTPRequest"
        component={OTPRequestScreen}
        options={{
          headerTitle: 'Verify Phone',
          headerBackTitle: 'Back',
        }}
      />

      <Stack.Screen
        name="OTPVerify"
        component={OTPVerifyScreen}
        options={({ route }) => ({
          headerTitle: 'Enter Verification Code',
          headerBackTitle: 'Back',
          // Prevent going back during critical OTP flows
          gestureEnabled: route.params?.verificationType !== 'password-reset',
        })}
      />

      <Stack.Screen
        name="BiometricSetup"
        component={BiometricSetupScreen}
        options={{
          headerTitle: 'Biometric Authentication',
          headerBackTitle: 'Skip',
        }}
      />

      <Stack.Screen
        name="TwoFactorSetup"
        component={TwoFactorSetupScreen}
        options={{
          headerTitle: 'Two-Factor Authentication',
          headerBackTitle: 'Back',
        }}
      />

      <Stack.Screen
        name="TwoFactorVerify"
        component={TwoFactorVerifyScreen}
        options={{
          headerTitle: 'Enter 2FA Code',
          headerBackTitle: 'Back',
          gestureEnabled: false, // Must complete 2FA
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  placeholderText: {
    ...theme.typography.headlineMedium,
    color: theme.colors.onBackground,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
});
