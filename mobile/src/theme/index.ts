/**
 * Theme Configuration
 * Central theme system following Material Design 3 principles
 */

export const colors = {
  // Primary Colors
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#60A5FA',
  onPrimary: '#FFFFFF',

  // Secondary Colors
  secondary: '#10B981',
  secondaryDark: '#059669',
  secondaryLight: '#34D399',
  onSecondary: '#FFFFFF',

  // Accent Colors
  accent: '#F59E0B',
  accentDark: '#D97706',
  accentLight: '#FBBF24',
  onAccent: '#FFFFFF',

  // Semantic Colors
  error: '#EF4444',
  errorDark: '#DC2626',
  errorLight: '#F87171',
  onError: '#FFFFFF',

  warning: '#F59E0B',
  warningDark: '#D97706',
  warningLight: '#FBBF24',
  onWarning: '#000000',

  success: '#10B981',
  successDark: '#059669',
  successLight: '#34D399',
  onSuccess: '#FFFFFF',

  info: '#3B82F6',
  infoDark: '#2563EB',
  infoLight: '#60A5FA',
  onInfo: '#FFFFFF',

  // Neutral Colors (Light Mode)
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceVariant: '#F3F4F6',
  outline: '#E5E7EB',
  outlineVariant: '#D1D5DB',

  // Material-style "on" colors / states
  onBackground: '#111827',
  onSurface: '#111827',
  onSurfaceVariant: '#6B7280',
  surfaceDisabled: '#E5E7EB',
  onSurfaceDisabled: '#9CA3AF',

  // Text Colors (Light Mode)
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textDisabled: '#D1D5DB',
  textOnPrimary: '#FFFFFF',

  // Dark Mode
  backgroundDark: '#111827',
  surfaceDark: '#1F2937',
  surfaceVariantDark: '#374151',
  outlineDark: '#4B5563',
  outlineVariantDark: '#6B7280',

  textDark: '#F9FAFB',
  textSecondaryDark: '#D1D5DB',
  textTertiaryDark: '#9CA3AF',
  textDisabledDark: '#6B7280',

  // Additional UI Colors
  border: '#E5E7EB',
  borderDark: '#374151',
  divider: '#F3F4F6',
  dividerDark: '#374151',
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',

  // Status Colors
  online: '#10B981',
  offline: '#6B7280',
  away: '#F59E0B',
  busy: '#EF4444',
};

export const typography = {
  // Display
  displayLarge: {
    fontFamily: 'System',
    fontSize: 57,
    fontWeight: '700' as const,
    lineHeight: 64,
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontFamily: 'System',
    fontSize: 45,
    fontWeight: '700' as const,
    lineHeight: 52,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: 'System',
    fontSize: 36,
    fontWeight: '700' as const,
    lineHeight: 44,
    letterSpacing: 0,
  },

  // Headline
  headlineLarge: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: 0,
  },

  // Title
  titleLarge: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  // Body
  bodyLarge: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.4,
  },

  // Label
  labelLarge: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },

  // Button
  button: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  buttonSmall: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0.5,
  },

  // Caption
  caption: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  overline: {
    fontFamily: 'System',
    fontSize: 10,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const animations = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export const breakpoints = {
  sm: 375,
  md: 768,
  lg: 1024,
  xl: 1280,
};

// Combined theme object
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  breakpoints,
};

export type Theme = typeof theme;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;

export default theme;
