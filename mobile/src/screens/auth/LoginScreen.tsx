/**
 * Login Screen
 *
 * User authentication with email/password or biometric login.
 * Includes form validation, loading states, and error handling.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { loginSchema, type LoginFormData } from '@/utils/validation';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/Button';
import Input from '@/components/Input';
import LoadingSpinner from '@/components/LoadingSpinner';
import { theme } from '@/theme';
import type { LoginScreenProps } from '@/navigation/types';

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const { login, loginWithBiometric, biometricEnabled, isLoading, error, clearError } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Clear error on unmount
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // Check if biometric is available
  useEffect(() => {
    setBiometricAvailable(biometricEnabled);
  }, [biometricEnabled]);

  // Show error toast
  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error,
        visibilityTime: 4000,
      });
    }
  }, [error]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: 'Login successful',
        visibilityTime: 2000,
      });
    } catch (err) {
      // Error handled by store
    }
  };

  const handleBiometricLogin = async () => {
    try {
      await loginWithBiometric();
      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: 'Biometric login successful',
        visibilityTime: 2000,
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Biometric Login Failed',
        text2: err.message || 'Please try again',
        visibilityTime: 4000,
      });
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    navigation.navigate('Register');
  };

  if (isLoading && !isSubmitting) {
    return <LoadingSpinner message="Signing in..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo/Header */}
        <View style={styles.header}>
          <Icon name="shopping" size={64} color={theme.colors.primary} />
          <Text style={styles.title}>Welcome to EasyCart</Text>
          <Text style={styles.subtitle}>Sign in to continue shopping</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                leftIcon="email-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                required
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                leftIcon="lock-outline"
                rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                secureTextEntry={!showPassword}
                autoComplete="password"
                textContentType="password"
                required
              />
            )}
          />

          {/* Forgot Password Link */}
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPassword}
            accessibilityRole="button"
            accessibilityLabel="Forgot password"
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <Button
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
            fullWidth
            style={styles.loginButton}
          >
            Sign In
          </Button>

          {/* Biometric Login Button */}
          {biometricAvailable && (
            <Button
              onPress={handleBiometricLogin}
              variant="outlined"
              icon="fingerprint"
              fullWidth
              style={styles.biometricButton}
            >
              Sign In with Biometrics
            </Button>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={handleSignUp}
            accessibilityRole="button"
            accessibilityLabel="Sign up"
          >
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Guest Continue (Optional) */}
        <Button
          onPress={() => {
            // TODO: Navigate to app as guest
            Toast.show({
              type: 'info',
              text1: 'Guest Mode',
              text2: 'Guest checkout coming soon!',
            });
          }}
          variant="text"
          fullWidth
          style={styles.guestButton}
        >
          Continue as Guest
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxxl,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  title: {
    fontSize: theme.typography.headlineLarge.fontSize,
    fontFamily: theme.typography.headlineLarge.fontFamily,
    fontWeight: theme.typography.headlineLarge.fontWeight,
    color: theme.colors.onBackground,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.bodyLarge.fontSize,
    fontFamily: theme.typography.bodyLarge.fontFamily,
    color: theme.colors.onSurfaceVariant,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -theme.spacing.xs,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.xs,
  },
  forgotPasswordText: {
    fontSize: theme.typography.bodyMedium.fontSize,
    fontFamily: theme.typography.bodyMedium.fontFamily,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    marginBottom: theme.spacing.md,
  },
  biometricButton: {
    marginTop: theme.spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.outlineVariant,
  },
  dividerText: {
    marginHorizontal: theme.spacing.md,
    fontSize: theme.typography.labelSmall.fontSize,
    fontFamily: theme.typography.labelSmall.fontFamily,
    color: theme.colors.onSurfaceVariant,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  signUpText: {
    fontSize: theme.typography.bodyMedium.fontSize,
    fontFamily: theme.typography.bodyMedium.fontFamily,
    color: theme.colors.onSurfaceVariant,
  },
  signUpLink: {
    fontSize: theme.typography.bodyMedium.fontSize,
    fontFamily: theme.typography.bodyMedium.fontFamily,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  guestButton: {
    marginTop: theme.spacing.md,
  },
});
