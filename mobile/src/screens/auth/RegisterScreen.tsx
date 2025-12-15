/**
 * Register Screen
 *
 * User registration with comprehensive form validation.
 * Includes password strength indicator and terms acceptance.
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
import { registerSchema, type RegisterFormData } from '@/utils/validation';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/Button';
import Input from '@/components/Input';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import LoadingSpinner from '@/components/LoadingSpinner';
import { theme } from '@/theme';
import type { RegisterScreenProps } from '@/navigation/types';

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const { register, isLoading, error, clearError } = useAuthStore();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const password = watch('password');

  // Clear error on unmount
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // Show error toast
  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error,
        visibilityTime: 4000,
      });
    }
  }, [error]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = data;

      await register(registerData);

      Toast.show({
        type: 'success',
        text1: 'Account Created!',
        text2: 'Welcome to EasyCart',
        visibilityTime: 2000,
      });

      // Navigate to OTP verification if required
      // navigation.navigate('OTPRequest', { email: data.email });
    } catch (err) {
      // Error handled by store
    }
  };

  const handleSignIn = () => {
    navigation.goBack();
  };

  if (isLoading && !isSubmitting) {
    return <LoadingSpinner message="Creating your account..." />;
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
        {/* Header */}
        <View style={styles.header}>
          <Icon name="account-plus-outline" size={48} color={theme.colors.primary} />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join EasyCart today</Text>
        </View>

        {/* Registration Form */}
        <View style={styles.form}>
          <View style={styles.nameRow}>
            <Controller
              control={control}
              name="first_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.nameInput}>
                  <Input
                    label="First Name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.first_name?.message}
                    leftIcon="account-outline"
                    autoCapitalize="words"
                    textContentType="givenName"
                    required
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="last_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.nameInput}>
                  <Input
                    label="Last Name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.last_name?.message}
                    autoCapitalize="words"
                    textContentType="familyName"
                    required
                  />
                </View>
              )}
            />
          </View>

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
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Phone Number"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phone?.message}
                leftIcon="phone-outline"
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                placeholder="+254712345678"
                required
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
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
                  autoComplete="password-new"
                  textContentType="newPassword"
                  required
                />
                <PasswordStrengthIndicator password={value} />
              </>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirm Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
                leftIcon="lock-check-outline"
                rightIcon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                secureTextEntry={!showConfirmPassword}
                autoComplete="password-new"
                textContentType="newPassword"
                required
              />
            )}
          />

          {/* Terms and Conditions */}
          <Controller
            control={control}
            name="acceptTerms"
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => {
                  const newValue = !value;
                  setAcceptedTerms(newValue);
                  onChange(newValue);
                }}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: value }}
                accessibilityLabel="Accept terms and conditions"
              >
                <Icon
                  name={value ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={24}
                  color={errors.acceptTerms ? theme.colors.error : theme.colors.primary}
                />
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink}>Terms & Conditions</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
            )}
          />
          {errors.acceptTerms && (
            <Text style={styles.termsError}>{errors.acceptTerms.message}</Text>
          )}

          {/* Register Button */}
          <Button
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
            fullWidth
            style={styles.registerButton}
          >
            Create Account
          </Button>
        </View>

        {/* Sign In Link */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={handleSignIn}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
          >
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
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
  nameRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  nameInput: {
    flex: 1,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    paddingRight: theme.spacing.md,
  },
  termsText: {
    flex: 1,
    fontSize: theme.typography.bodySmall.fontSize,
    fontFamily: theme.typography.bodySmall.fontFamily,
    color: theme.colors.onSurfaceVariant,
    marginLeft: theme.spacing.sm,
    lineHeight: 20,
  },
  termsLink: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  termsError: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontFamily: theme.typography.bodySmall.fontFamily,
    color: theme.colors.error,
    marginTop: -theme.spacing.md,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.md,
  },
  registerButton: {
    marginTop: theme.spacing.md,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  signInText: {
    fontSize: theme.typography.bodyMedium.fontSize,
    fontFamily: theme.typography.bodyMedium.fontFamily,
    color: theme.colors.onSurfaceVariant,
  },
  signInLink: {
    fontSize: theme.typography.bodyMedium.fontSize,
    fontFamily: theme.typography.bodyMedium.fontFamily,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
