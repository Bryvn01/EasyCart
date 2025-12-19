/**
 * Button Component
 *
 * Accessible, customizable button following Material Design 3.
 * Supports loading states, icons, and different variants.
 */

import React from 'react';
import {
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '@/theme';

export type ButtonVariant = 'filled' | 'outlined' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  /** Button text */
  children: string;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Icon name (MaterialCommunityIcons) */
  icon?: string;
  /** Icon position */
  iconPosition?: 'left' | 'right';
  /** Full width button */
  fullWidth?: boolean;
  /** Custom style */
  style?: StyleProp<ViewStyle>;
  /** Custom text style */
  textStyle?: StyleProp<TextStyle>;
}

export default function Button({
  children,
  variant = 'filled',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const variantStyles: Record<ButtonVariant, StyleProp<ViewStyle>> = {
    filled: styles.filled,
    outlined: styles.outlined,
    text: styles.text,
  };

  const sizeStyles: Record<ButtonSize, StyleProp<ViewStyle>> = {
    small: styles.size_small,
    medium: styles.size_medium,
    large: styles.size_large,
  };

  const variantDisabledStyles: Partial<Record<ButtonVariant, StyleProp<ViewStyle>>> = {
    filled: styles.filled_disabled,
    outlined: styles.outlined_disabled,
  };

  const textVariantStyles: Record<ButtonVariant, StyleProp<TextStyle>> = {
    filled: styles.text_filled,
    outlined: styles.text_outlined,
    text: styles.text_text,
  };

  const textSizeStyles: Record<ButtonSize, StyleProp<TextStyle>> = {
    small: styles.text_small,
    medium: styles.text_medium,
    large: styles.text_large,
  };

  // Dynamic styles based on variant and state
  const buttonStyles = [
    styles.base,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    isDisabled && variantDisabledStyles[variant],
    style,
  ];

  const textStyles = [
    styles.text,
    textVariantStyles[variant],
    textSizeStyles[size],
    isDisabled && styles.text_disabled,
    textStyle,
  ];

  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  const iconColor =
    variant === 'filled'
      ? theme.colors.onPrimary
      : isDisabled
      ? theme.colors.onSurfaceDisabled
      : theme.colors.primary;

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={children}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'filled' ? theme.colors.onPrimary : theme.colors.primary}
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Icon name={icon} size={iconSize} color={iconColor} style={styles.iconLeft} />
          )}
          <Text style={textStyles}>{children}</Text>
          {icon && iconPosition === 'right' && (
            <Icon name={icon} size={iconSize} color={iconColor} style={styles.iconRight} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.full,
  },

  // Variants
  filled: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  text: {
    backgroundColor: 'transparent',
  },

  // Sizes
  size_small: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    minHeight: 36,
  },
  size_medium: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    minHeight: 44,
  },
  size_large: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    minHeight: 52,
  },

  // Disabled states
  disabled: {
    opacity: 0.6,
  },
  filled_disabled: {
    backgroundColor: theme.colors.surfaceDisabled,
    elevation: 0,
    shadowOpacity: 0,
  },
  outlined_disabled: {
    borderColor: theme.colors.outlineVariant,
  },

  // Full width
  fullWidth: {
    width: '100%',
  },

  // Text styles
  text_filled: {
    color: theme.colors.onPrimary,
    fontFamily: theme.typography.labelLarge.fontFamily,
    fontWeight: theme.typography.labelLarge.fontWeight,
  },
  text_outlined: {
    color: theme.colors.primary,
    fontFamily: theme.typography.labelLarge.fontFamily,
    fontWeight: theme.typography.labelLarge.fontWeight,
  },
  text_text: {
    color: theme.colors.primary,
    fontFamily: theme.typography.labelLarge.fontFamily,
    fontWeight: theme.typography.labelLarge.fontWeight,
  },
  text_small: {
    fontSize: theme.typography.labelMedium.fontSize,
  },
  text_medium: {
    fontSize: theme.typography.labelLarge.fontSize,
  },
  text_large: {
    fontSize: 16,
  },
  text_disabled: {
    color: theme.colors.onSurfaceDisabled,
  },

  // Content and icons
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: theme.spacing.xs,
  },
  iconRight: {
    marginLeft: theme.spacing.xs,
  },
});
