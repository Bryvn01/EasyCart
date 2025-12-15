/**
 * Input Component
 *
 * Accessible text input with validation, icons, and error states.
 * Compatible with react-hook-form.
 */

import React, { useState } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '@/theme';

interface InputProps extends TextInputProps {
  /** Input label */
  label: string;
  /** Error message */
  error?: string;
  /** Helper text shown below input */
  helperText?: string;
  /** Left icon name */
  leftIcon?: string;
  /** Right icon name */
  rightIcon?: string;
  /** Right icon press handler */
  onRightIconPress?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Required field indicator */
  required?: boolean;
}

export default function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  disabled = false,
  required = false,
  value,
  onFocus,
  onBlur,
  style,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [labelAnimation] = useState(new Animated.Value(value ? 1 : 0));

  const hasError = !!error;
  const hasValue = !!value;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(labelAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (!hasValue) {
      Animated.timing(labelAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    onBlur?.(e);
  };

  // Dynamic styles
  const containerStyles = [
    styles.container,
    isFocused && styles.containerFocused,
    hasError && styles.containerError,
    disabled && styles.containerDisabled,
  ];

  const labelColor = hasError
    ? theme.colors.error
    : isFocused
    ? theme.colors.primary
    : theme.colors.onSurfaceVariant;

  const borderColor = hasError
    ? theme.colors.error
    : isFocused
    ? theme.colors.primary
    : theme.colors.outline;

  const labelTop = labelAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [16, -8],
  });

  const labelFontSize = labelAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  });

  return (
    <View style={styles.wrapper}>
      <View style={[containerStyles, { borderColor }]}>
        {/* Floating Label */}
        <Animated.View
          style={[
            styles.labelContainer,
            {
              top: labelTop,
              backgroundColor: isFocused || hasValue ? theme.colors.background : 'transparent',
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.label,
              { color: labelColor, fontSize: labelFontSize },
            ]}
          >
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Animated.Text>
        </Animated.View>

        {/* Left Icon */}
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={20}
            color={hasError ? theme.colors.error : theme.colors.onSurfaceVariant}
            style={styles.leftIcon}
          />
        )}

        {/* Text Input */}
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            style,
          ]}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          selectionColor={theme.colors.primary}
          accessibilityLabel={label}
          accessibilityState={{ disabled }}
          accessibilityHint={helperText || error}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightIconContainer}
            accessibilityRole="button"
            accessibilityLabel={`${label} action`}
          >
            <Icon
              name={rightIcon}
              size={20}
              color={hasError ? theme.colors.error : theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Helper Text or Error */}
      {(helperText || error) && (
        <Text
          style={[
            styles.helperText,
            hasError && styles.errorText,
          ]}
          accessibilityLiveRegion="polite"
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.md,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    minHeight: 56,
    paddingHorizontal: theme.spacing.md,
    position: 'relative',
  },
  containerFocused: {
    borderWidth: 2,
  },
  containerError: {
    borderWidth: 2,
  },
  containerDisabled: {
    backgroundColor: theme.colors.surfaceDisabled,
    opacity: 0.6,
  },
  labelContainer: {
    position: 'absolute',
    left: 12,
    paddingHorizontal: 4,
    zIndex: 1,
  },
  label: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontWeight: theme.typography.bodyMedium.fontWeight,
  },
  required: {
    color: theme.colors.error,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.bodyLarge.fontSize,
    fontFamily: theme.typography.bodyLarge.fontFamily,
    color: theme.colors.onSurface,
    paddingVertical: theme.spacing.sm,
  },
  inputWithLeftIcon: {
    paddingLeft: theme.spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: theme.spacing.xs,
  },
  leftIcon: {
    marginRight: theme.spacing.xs,
  },
  rightIconContainer: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  helperText: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontFamily: theme.typography.bodySmall.fontFamily,
    color: theme.colors.onSurfaceVariant,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
  },
});
