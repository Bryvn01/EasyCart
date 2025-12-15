/**
 * Password Strength Indicator Component
 *
 * Visual indicator showing password strength with color coding.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { calculatePasswordStrength } from '@/utils/validation';
import { theme } from '@/theme';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export default function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const { score, label, color } = calculatePasswordStrength(password);
  const strengthPercentage = (score / 6) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        <View
          style={[
            styles.barFill,
            { width: `${strengthPercentage}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  barContainer: {
    height: 4,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
    transition: 'width 0.3s ease, background-color 0.3s ease',
  },
  label: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontWeight: '600',
    marginTop: theme.spacing.xs,
  },
});
