/**
 * Progress Bar Component
 * Interactive progress bar for audio playback
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

import { ThemeConfig } from '../../types/theme';
import { formatDuration } from '../../utils/timeUtils';

export interface ProgressBarProps {
  position: number;
  duration: number;
  bufferedPosition: number;
  theme: ThemeConfig;
  onSeek: (position: number) => void;
  style?: any;
  disabled?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  position,
  duration,
  bufferedPosition,
  theme,
  onSeek,
  style,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);

  const progress = duration > 0 ? position / duration : 0;
  const bufferedProgress = duration > 0 ? bufferedPosition / duration : 0;
  const displayPosition = isDragging ? dragPosition : position;

  const handleTrackPress = useCallback((event: any) => {
    if (disabled || duration <= 0) return;

    // Simple touch-to-seek implementation
    // In a real app, you'd calculate based on touch position relative to track width
    const touchX = event.nativeEvent.locationX;
    const trackWidth = 300; // Approximate track width
    const newProgress = Math.max(0, Math.min(1, touchX / trackWidth));
    const newPosition = newProgress * duration;
    
    onSeek(newPosition);
  }, [disabled, duration, onSeek]);

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, style]}>
      {/* Time Labels */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>
          {formatDuration(displayPosition)}
        </Text>
        <Text style={styles.timeText}>
          {formatDuration(duration)}
        </Text>
      </View>

      {/* Progress Track */}
      <View style={styles.trackContainer}>
        {/* Background Track */}
        <View style={styles.track} />
        
        {/* Buffered Progress */}
        <View 
          style={[
            styles.bufferedTrack,
            { width: `${bufferedProgress * 100}%` }
          ]} 
        />
        
        {/* Progress Track */}
        <View 
          style={[
            styles.progressTrack,
            { width: `${progress * 100}%` }
          ]} 
        />
        
        {/* Thumb */}
        {!disabled && (
          <View 
            style={[
              styles.thumb,
              { left: `${progress * 100}%` },
              isDragging && styles.thumbActive
            ]} 
          />
        )}

        {/* Touch Handler Overlay */}
        {!disabled && (
          <TouchableOpacity
            style={styles.touchOverlay}
            onPress={handleTrackPress}
            activeOpacity={1}
          />
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: ThemeConfig) => StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    color: theme.textColor + 'CC',
    fontWeight: '500',
  },
  trackContainer: {
    height: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 4,
    backgroundColor: theme.textColor + '20',
    borderRadius: 2,
  },
  bufferedTrack: {
    position: 'absolute',
    height: 4,
    backgroundColor: theme.textColor + '40',
    borderRadius: 2,
  },
  progressTrack: {
    position: 'absolute',
    height: 4,
    backgroundColor: theme.accentColor,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.accentColor,
    marginLeft: -8,
    marginTop: -6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbActive: {
    transform: [{ scale: 1.2 }],
  },
  touchOverlay: {
    position: 'absolute',
    top: -10,
    bottom: -10,
    left: 0,
    right: 0,
  },
});