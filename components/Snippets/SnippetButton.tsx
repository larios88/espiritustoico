/**
 * Snippet Button Component
 * Button to create a snippet from current playback position
 */

import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet
} from 'react-native';

import { ThemeConfig } from '../../types/theme';

export interface SnippetButtonProps {
  theme: ThemeConfig;
  onPress: () => void;
  disabled?: boolean;
  style?: any;
}

export const SnippetButton: React.FC<SnippetButtonProps> = ({
  theme,
  onPress,
  disabled = false,
  style
}) => {
  const styles = createStyles(theme);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel="Create snippet"
      accessibilityHint="Create a shareable audio snippet from this episode"
    >
      <Text style={[
        styles.icon,
        disabled && styles.iconDisabled
      ]}>
        ✂️
      </Text>
      <Text style={[
        styles.label,
        disabled && styles.labelDisabled
      ]}>
        Snippet
      </Text>
    </TouchableOpacity>
  );
};

const createStyles = (theme: ThemeConfig) => StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: theme.textColor + '10',
    minWidth: 80,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 20,
    marginBottom: 4,
  },
  iconDisabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 12,
    color: theme.textColor,
    fontWeight: '500',
  },
  labelDisabled: {
    opacity: 0.5,
  },
});