/**
 * Bookmark Button Component
 * Button to create a bookmark at current playback position
 */

import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert
} from 'react-native';

import { ThemeConfig } from '../../types/theme';
import { BookmarkCreateData } from '../../types/bookmark';

export interface BookmarkButtonProps {
  theme: ThemeConfig;
  episodeId: string;
  currentPosition: number;
  onCreateBookmark: (data: BookmarkCreateData) => Promise<void>;
  disabled?: boolean;
  style?: any;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  theme,
  episodeId,
  currentPosition,
  onCreateBookmark,
  disabled = false,
  style
}) => {
  const [isCreating, setIsCreating] = useState(false);

  const handlePress = async () => {
    if (disabled || isCreating) return;

    // Show prompt for bookmark note
    Alert.prompt(
      'Add Bookmark',
      'Add a note for this bookmark (optional):',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Save',
          onPress: async (note) => {
            setIsCreating(true);
            try {
              await onCreateBookmark({
                episodeId,
                timestamp: Math.floor(currentPosition),
                note: note || `Bookmark at ${formatTimestamp(currentPosition)}`
              });
            } catch (error) {
              console.error('Failed to create bookmark:', error);
              Alert.alert('Error', 'Failed to create bookmark. Please try again.');
            } finally {
              setIsCreating(false);
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const styles = createStyles(theme);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        style
      ]}
      onPress={handlePress}
      disabled={disabled || isCreating}
      accessibilityLabel="Add bookmark"
      accessibilityHint="Add a bookmark at the current playback position"
    >
      <Text style={[
        styles.icon,
        disabled && styles.iconDisabled
      ]}>
        {isCreating ? '⟳' : '🔖'}
      </Text>
      <Text style={[
        styles.label,
        disabled && styles.labelDisabled
      ]}>
        {isCreating ? 'Adding...' : 'Bookmark'}
      </Text>
    </TouchableOpacity>
  );
};

const formatTimestamp = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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