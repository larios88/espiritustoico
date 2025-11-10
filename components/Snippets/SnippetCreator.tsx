/**
 * Snippet Creator Component
 * Interface for creating audio snippets with timestamp selection
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';

import { 
  SnippetCreateData, 
  validateSnippetCreateData, 
  formatSnippetDuration,
  formatSnippetRange,
  calculateSnippetBoundaries,
  validateSnippetWithinEpisode,
  MAX_SNIPPET_DURATION
} from '../../types/snippet';
import { ThemeConfig } from '../../types/theme';

export interface SnippetCreatorProps {
  theme: ThemeConfig;
  episodeId: string;
  episodeDuration: number;
  currentPosition: number;
  onCreateSnippet: (data: SnippetCreateData) => Promise<void>;
  onCancel: () => void;
  style?: any;
}

export const SnippetCreator: React.FC<SnippetCreatorProps> = ({
  theme,
  episodeId,
  episodeDuration,
  currentPosition,
  onCreateSnippet,
  onCancel,
  style
}) => {
  const [title, setTitle] = useState('');
  const [startTimestamp, setStartTimestamp] = useState(0);
  const [endTimestamp, setEndTimestamp] = useState(30);
  const [isCreating, setIsCreating] = useState(false);

  // Initialize snippet boundaries based on current position
  useEffect(() => {
    const boundaries = calculateSnippetBoundaries(currentPosition, episodeDuration);
    setStartTimestamp(boundaries.start);
    setEndTimestamp(boundaries.end);
    setTitle(`Snippet at ${formatSnippetRange(boundaries.start, boundaries.end)}`);
  }, [currentPosition, episodeDuration]);

  const duration = endTimestamp - startTimestamp;
  const isValidDuration = duration > 0 && duration <= MAX_SNIPPET_DURATION;

  const handleStartChange = (value: number) => {
    const newStart = Math.max(0, Math.min(value, episodeDuration - 1));
    setStartTimestamp(newStart);
    
    // Adjust end timestamp if needed
    if (newStart >= endTimestamp) {
      const newEnd = Math.min(episodeDuration, newStart + 30);
      setEndTimestamp(newEnd);
    }
  };

  const handleEndChange = (value: number) => {
    const newEnd = Math.max(startTimestamp + 1, Math.min(value, episodeDuration));
    setEndTimestamp(newEnd);
    
    // Ensure duration doesn't exceed maximum
    if (newEnd - startTimestamp > MAX_SNIPPET_DURATION) {
      setStartTimestamp(newEnd - MAX_SNIPPET_DURATION);
    }
  };

  const handleCreate = async () => {
    if (isCreating) return;

    // Validate input
    const snippetData: SnippetCreateData = {
      episodeId,
      startTimestamp,
      endTimestamp,
      title: title.trim() || `Snippet at ${formatSnippetRange(startTimestamp, endTimestamp)}`
    };

    const validation = validateSnippetCreateData(snippetData);
    if (!validation.isValid) {
      Alert.alert('Invalid Snippet', validation.errors.join('\n'));
      return;
    }

    const episodeValidation = validateSnippetWithinEpisode(
      startTimestamp, 
      endTimestamp, 
      episodeDuration
    );
    if (!episodeValidation.isValid) {
      Alert.alert('Invalid Snippet', episodeValidation.errors.join('\n'));
      return;
    }

    setIsCreating(true);
    try {
      await onCreateSnippet(snippetData);
    } catch (error) {
      console.error('Failed to create snippet:', error);
      Alert.alert('Error', 'Failed to create snippet. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Create Snippet</Text>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          accessibilityLabel="Cancel snippet creation"
        >
          <Text style={styles.cancelIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Title Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Snippet Title</Text>
        <View style={styles.titleInput}>
          <Text style={styles.titleText}>
            {title || `Snippet at ${formatSnippetRange(startTimestamp, endTimestamp)}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editTitleButton}
          onPress={() => {
            Alert.prompt(
              'Edit Title',
              'Enter snippet title:',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Save', onPress: (newTitle) => setTitle(newTitle || '') }
              ],
              'plain-text',
              title
            );
          }}
        >
          <Text style={styles.editTitleText}>Edit Title</Text>
        </TouchableOpacity>
        <Text style={styles.characterCount}>
          {title.length}/100 characters
        </Text>
      </View>

      {/* Time Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Time Range</Text>
        
        {/* Start Time */}
        <View style={styles.timeControl}>
          <Text style={styles.timeLabel}>Start: {formatTime(startTimestamp)}</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => handleStartChange(Math.max(0, startTimestamp - 5))}
            >
              <Text style={styles.timeButtonText}>-5s</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => handleStartChange(Math.min(episodeDuration - 1, startTimestamp + 5))}
            >
              <Text style={styles.timeButtonText}>+5s</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* End Time */}
        <View style={styles.timeControl}>
          <Text style={styles.timeLabel}>End: {formatTime(endTimestamp)}</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => handleEndChange(Math.max(startTimestamp + 1, endTimestamp - 5))}
            >
              <Text style={styles.timeButtonText}>-5s</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => handleEndChange(Math.min(episodeDuration, endTimestamp + 5))}
            >
              <Text style={styles.timeButtonText}>+5s</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Duration Info */}
        <View style={styles.durationInfo}>
          <Text style={[
            styles.durationText,
            !isValidDuration ? styles.durationError : {}
          ]}>
            Duration: {formatSnippetDuration(duration)}
          </Text>
          {duration > MAX_SNIPPET_DURATION && (
            <Text style={styles.errorText}>
              Maximum duration is {MAX_SNIPPET_DURATION} seconds
            </Text>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.cancelActionButton}
          onPress={onCancel}
          accessibilityLabel="Cancel"
        >
          <Text style={styles.cancelActionText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.createButton,
            (!isValidDuration || isCreating) ? styles.createButtonDisabled : {}
          ]}
          onPress={handleCreate}
          disabled={!isValidDuration || isCreating}
          accessibilityLabel="Create snippet"
        >
          <Text style={[
            styles.createButtonText,
            (!isValidDuration || isCreating) ? styles.createButtonTextDisabled : {}
          ]}>
            {isCreating ? 'Creating...' : 'Create Snippet'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const createStyles = (theme: ThemeConfig) => StyleSheet.create({
  container: {
    backgroundColor: theme.backgroundColor,
    padding: 20,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textColor,
  },
  cancelButton: {
    padding: 8,
  },
  cancelIcon: {
    fontSize: 18,
    color: theme.textColor,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textColor,
    marginBottom: 12,
  },
  titleInput: {
    backgroundColor: theme.textColor + '10',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  titleText: {
    fontSize: 16,
    color: theme.textColor,
  },
  editTitleButton: {
    backgroundColor: theme.accentColor + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  editTitleText: {
    fontSize: 12,
    color: theme.accentColor,
    fontWeight: '500',
  },
  characterCount: {
    fontSize: 12,
    color: theme.textColor + 'CC',
    textAlign: 'right',
  },
  timeControl: {
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textColor,
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  timeButton: {
    backgroundColor: theme.textColor + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textColor,
  },
  durationInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.accentColor,
  },
  durationError: {
    color: '#ff4444',
  },
  errorText: {
    fontSize: 12,
    color: '#ff4444',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelActionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: theme.textColor + '20',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textColor,
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: theme.accentColor,
    marginLeft: 8,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: theme.textColor + '40',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.backgroundColor,
  },
  createButtonTextDisabled: {
    color: theme.textColor + '80',
  },
});