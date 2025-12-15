/**
 * Loading Spinner Component
 *
 * Centered loading indicator with optional message.
 * Can be used as overlay or inline.
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';
import { theme } from '@/theme';

interface LoadingSpinnerProps {
  /** Loading message */
  message?: string;
  /** Show as full-screen overlay */
  overlay?: boolean;
  /** Custom size */
  size?: 'small' | 'large';
  /** Custom color */
  color?: string;
}

export default function LoadingSpinner({
  message,
  overlay = false,
  size = 'large',
  color = theme.colors.primary,
}: LoadingSpinnerProps) {
  const content = (
    <View style={[styles.container, overlay && styles.overlayContainer]}>
      <View style={overlay ? styles.overlayContent : undefined}>
        <ActivityIndicator size={size} color={color} />
        {message && (
          <Text style={styles.message} accessibilityLiveRegion="polite">
            {message}
          </Text>
        )}
      </View>
    </View>
  );

  if (overlay) {
    return (
      <Modal transparent visible animationType="fade">
        {content}
      </Modal>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayContent: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    minWidth: 120,
    ...theme.shadows.md,
  },
  message: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.bodyMedium.fontSize,
    fontFamily: theme.typography.bodyMedium.fontFamily,
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
});
