/**
 * Advertisement Player Component
 * Handles pre-roll and mid-roll video/audio advertisements
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';

import { AdContent, canSkipAd, isAdCompleted } from '../../types/advertisement';
import { ThemeConfig } from '../../types/theme';

export interface AdPlayerProps {
  adContent: AdContent;
  theme: ThemeConfig;
  onAdComplete: () => void;
  onAdSkip: () => void;
  onAdClick?: () => void;
  onAdError?: (error: string) => void;
  style?: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const AdPlayer = (props: AdPlayerProps) => {
  const {
    adContent,
    theme,
    onAdComplete,
    onAdSkip,
    onAdClick,
    onAdError,
    style
  } = props;

  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const timerRef = useRef<any>(null);

  // Start ad playback
  useEffect(() => {
    if (!hasError && !isCompleted) {
      setIsPlaying(true);
      startTimer();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [hasError, isCompleted]);

  // Check skip availability and completion
  useEffect(() => {
    const skipAvailable = canSkipAd(adContent, elapsedTime);
    const completed = isAdCompleted(adContent, elapsedTime);

    setCanSkip(skipAvailable);

    if (completed && !isCompleted) {
      setIsCompleted(true);
      setIsPlaying(false);
      onAdComplete();
    }
  }, [elapsedTime, adContent, isCompleted, onAdComplete]);

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  }, []);

  const handleSkip = useCallback(() => {
    if (canSkip) {
      setIsPlaying(false);
      setIsCompleted(true);
      onAdSkip();
    }
  }, [canSkip, onAdSkip]);

  const handleAdClick = useCallback(() => {
    if (onAdClick) {
      onAdClick();
    }
  }, [onAdClick]);

  const handleError = useCallback((error: string) => {
    setHasError(true);
    setIsPlaying(false);
    if (onAdError) {
      onAdError(error);
    }
  }, [onAdError]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRemainingTime = (): number => {
    if (!adContent.duration) return 0;
    return Math.max(0, adContent.duration - elapsedTime);
  };

  const getProgress = (): number => {
    if (!adContent.duration) return 0;
    return Math.min(100, (elapsedTime / adContent.duration) * 100);
  };

  const styles = createStyles(theme);

  if (hasError) {
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <Text style={styles.errorText}>Advertisement failed to load</Text>
        <TouchableOpacity style={styles.skipButton} onPress={onAdComplete}>
          <Text style={styles.skipButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Ad Content Area */}
      <TouchableOpacity
        style={styles.adContentArea}
        onPress={handleAdClick}
        activeOpacity={0.9}
      >
        {/* Placeholder for video/image content */}
        <View style={styles.adPlaceholder}>
          <Text style={styles.adContentText}>
            {adContent.content}
          </Text>
          
          {/* Play indicator */}
          {isPlaying && (
            <View style={styles.playIndicator}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
          )}
        </View>

        {/* Ad overlay info */}
        <View style={styles.adOverlay}>
          <View style={styles.adInfo}>
            <Text style={styles.adLabel}>Advertisement</Text>
            {adContent.duration && (
              <Text style={styles.adDuration}>
                {formatTime(getRemainingTime())} remaining
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Progress Bar */}
      {adContent.duration && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View 
              style={[
                styles.progressFill,
                { width: `${getProgress()}%` }
              ]} 
            />
          </View>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.timeInfo}>
          <Text style={styles.timeText}>
            {formatTime(elapsedTime)}
            {adContent.duration && ` / ${formatTime(adContent.duration)}`}
          </Text>
        </View>

        {/* Skip Button */}
        <TouchableOpacity
          style={[
            styles.skipButton,
            !canSkip && styles.skipButtonDisabled
          ]}
          onPress={handleSkip}
          disabled={!canSkip}
        >
          <Text style={[
            styles.skipButtonText,
            !canSkip && styles.skipButtonTextDisabled
          ]}>
            {canSkip ? 'Skip Ad' : `Skip in ${(adContent.skipAfter || 0) - elapsedTime}s`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (theme: ThemeConfig) => StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    width: screenWidth,
    height: screenHeight * 0.6, // 60% of screen height
  },
  adContentArea: {
    flex: 1,
    position: 'relative',
  },
  adPlaceholder: {
    flex: 1,
    backgroundColor: theme.textColor + '20',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  adContentText: {
    fontSize: 18,
    color: theme.textColor,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  playIndicator: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 2,
  },
  adOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  adInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  adDuration: {
    fontSize: 12,
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.accentColor,
    borderRadius: 1.5,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  timeInfo: {
    flex: 1,
  },
  timeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  skipButton: {
    backgroundColor: theme.accentColor,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  skipButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  skipButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  skipButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.backgroundColor,
  },
  errorText: {
    fontSize: 16,
    color: theme.textColor,
    textAlign: 'center',
    marginBottom: 20,
  },
});