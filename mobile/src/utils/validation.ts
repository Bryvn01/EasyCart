/**
 * Form Validation Schemas
 *
 * Zod schemas for form validation across the app.
 * Provides type-safe validation with helpful error messages.
 */

import { z } from 'zod';

/**
 * Common field validators
 */
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(/^(\+\d{1,3}[- ]?)?\d{10}$/, 'Please enter a valid phone number');

const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must not exceed 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

const otpSchema = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only numbers');

/**
 * Authentication Schemas
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    first_name: nameSchema,
    last_name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const otpRequestSchema = z.object({
  phone: phoneSchema,
});

export const otpVerifySchema = z.object({
  otp: otpSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

/**
 * Profile Schemas
 */
export const editProfileSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
});

/**
 * Address Schemas
 */
export const addressSchema = z.object({
  street: z.string().min(5, 'Street address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  country: z.string().min(2, 'Country is required'),
  isDefault: z.boolean().optional(),
});

/**
 * Review Schemas
 */
export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be between 1 and 5'),
  comment: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(500, 'Review must not exceed 500 characters'),
});

/**
 * Search Schema
 */
export const searchSchema = z.object({
  query: z.string().min(2, 'Search query must be at least 2 characters'),
});

/**
 * Payment Schemas
 */
export const mpesaPaymentSchema = z.object({
  phoneNumber: phoneSchema,
  amount: z.number().min(1, 'Amount must be greater than 0'),
});

/**
 * Type exports for TypeScript
 */
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type OTPRequestFormData = z.infer<typeof otpRequestSchema>;
export type OTPVerifyFormData = z.infer<typeof otpVerifySchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type EditProfileFormData = z.infer<typeof editProfileSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type MpesaPaymentFormData = z.infer<typeof mpesaPaymentSchema>;

/**
 * Password strength calculator
 */
export const calculatePasswordStrength = (password: string): {
  score: number;
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
} => {
  let score = 0;

  if (password.length >= 8) {
    score++;
  }
  if (password.length >= 12) {
    score++;
  }
  if (/[a-z]/.test(password)) {
    score++;
  }
  if (/[A-Z]/.test(password)) {
    score++;
  }
  if (/[0-9]/.test(password)) {
    score++;
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  }

  if (score <= 2) {
    return { score, label: 'Weak', color: '#F44336' };
  } else if (score <= 4) {
    return { score, label: 'Fair', color: '#FF9800' };
  } else if (score === 5) {
    return { score, label: 'Good', color: '#4CAF50' };
  } else {
    return { score, label: 'Strong', color: '#2196F3' };
  }
};
