/**
 * Episode Card Component
 * Individual episode card with artwork, info, and controls
 * Enhanced with Pocket Casts-inspired design and smooth animations
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Animated
} from 'react-native';

import { Episode } from '../../types/episode';
import { ThemeConfig } from '../../types/theme';
import { formatDuration, formatDate } from '../../utils/timeUtils';
import { calculateProgress } from '../../types/episode';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS, EPISODE_CARD } from '../../constants/design';
import { createButtonPressEffect, createFadeAnimation } from '../../utils/animations';

export interface EpisodeCardProps {
  episode: Episode;
  theme: ThemeConfig;
  isPlaying?: boolean;
  onPress: () => void;
  onPlayPress?: () => void;
  showIndex?: boolean;
  indexLabel?: string;
  isRecommended?: boolean;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const EpisodeCard = (props: EpisodeCardProps) => {
  const {
    episode,
    theme,
    isPlaying = false,
    onPress,
    onPlayPress,
    showIndex = false,
    indexLabel,
    isRecommended = false,
    style
  } = props;

  const progress = calculateProgress(episode.lastPlayedPosition, episode.duration);
  const hasProgress = progress > 0 && progress < 90;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { scaleValue, pressIn, pressOut } = createButtonPressEffect();
  const playButtonScale = useRef(new Animated.Value(1)).current;

  // Fade in animation on mount
  useEffect(() => {
    createFadeAnimation(fadeAnim, 1, 300).start();
  }, []);

  // Play button animation when playing state changes
  useEffect(() => {
    if (isPlaying) {
      Animated.spring(playButtonScale, {
        toValue: 1.1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(playButtonScale, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }).start();
    }
  }, [isPlaying]);

  const styles = createStyles(theme, isPlaying, isRecommended);

  return (
    <Animated.View style={[{ opacity: fadeAnim, transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`Play episode: ${episode.title}`}
        accessibilityHint="Double tap to play episode"
      >
        {/* Recommended Badge */}
        {isRecommended && (
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedText}>Most Popular</Text>
          </View>
        )}

        {/* Index Label */}
        {showIndex && indexLabel && (
          <View style={styles.indexContainer}>
            <Text style={styles.indexLabel}>{indexLabel}</Text>
          </View>
        )}

        <View style={styles.content}>
          {/* Episode Artwork */}
          <View style={styles.artworkContainer}>
            <Image
              source={{ uri: episode.artwork }}
              style={styles.artwork}
              resizeMode="cover"
            />
            
            {/* Play Button Overlay */}
            {onPlayPress && (
              <Animated.View style={[styles.playOverlay, { transform: [{ scale: playButtonScale }] }]}>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={onPlayPress}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={isPlaying ? 'Pause episode' : 'Play episode'}
                >
                  <View style={styles.playIconContainer}>
                    <Text style={styles.playIcon}>
                      {isPlaying ? '⏸' : '▶'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Progress Indicator */}
            {hasProgress && (
              <View style={styles.progressContainer}>
                <Animated.View 
                  style={[
                    styles.progressBar,
                    { width: `${progress}%` }
                  ]} 
                />
              </View>
            )}

            {/* Playing Indicator */}
            {isPlaying && (
              <View style={styles.playingIndicator}>
                <View style={styles.playingDot} />
              </View>
            )}
          </View>

          {/* Episode Info */}
          <View style={styles.infoContainer}>
            {/* Title */}
            <Text style={styles.title} numberOfLines={2}>
              {episode.title}
            </Text>

            {/* Description */}
            <Text style={styles.description} numberOfLines={3}>
              {episode.description}
            </Text>

            {/* Metadata */}
            <View style={styles.metadataContainer}>
              <Text style={styles.metadata}>
                {formatDuration(episode.duration)}
              </Text>
              <View style={styles.metadataDot} />
              <Text style={styles.metadata}>
                {formatDate(episode.publishDate)}
              </Text>
            </View>

            {/* Progress Text */}
            {hasProgress && (
              <Text style={styles.progressText}>
                {Math.round(progress)}% complete • {formatDuration(episode.lastPlayedPosition)} of {formatDuration(episode.duration)}
              </Text>
            )}

            {/* Badges Container */}
            <View style={styles.badgesContainer}>
              {/* Download Status */}
              {episode.isDownloaded && (
                <View style={styles.downloadBadge}>
                  <Text style={styles.downloadText}>Downloaded</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const createStyles = (theme: ThemeConfig, isPlaying: boolean, isRecommended: boolean) => StyleSheet.create({
  container: {
    backgroundColor: isPlaying ? theme.accentColor + '15' : 'transparent',
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
    borderWidth: isPlaying ? 1 : 0,
    borderColor: isPlaying ? theme.accentColor + '30' : 'transparent',
  },
  
  recommendedBadge: {
    position: 'absolute',
    top: -SPACING.xs,
    right: SPACING.md,
    backgroundColor: theme.accentColor,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    zIndex: 1,
  },
  
  recommendedText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: theme.backgroundColor,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  
  indexContainer: {
    marginBottom: SPACING.sm,
  },
  
  indexLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: theme.accentColor,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  artworkContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  
  artwork: {
    width: EPISODE_CARD.artwork.size,
    height: EPISODE_CARD.artwork.size,
    borderRadius: EPISODE_CARD.artwork.borderRadius,
    backgroundColor: theme.textColor + '10',
  },
  
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  
  playIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  playIcon: {
    fontSize: 16,
    color: 'white',
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
    marginLeft: Platform.OS === 'android' ? 2 : 0, // Adjust for visual centering
  },
  
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: EPISODE_CARD.progressBar.height,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomLeftRadius: EPISODE_CARD.artwork.borderRadius,
    borderBottomRightRadius: EPISODE_CARD.artwork.borderRadius,
  },
  
  progressBar: {
    height: '100%',
    backgroundColor: theme.accentColor,
    borderBottomLeftRadius: EPISODE_CARD.artwork.borderRadius,
    borderBottomRightRadius: EPISODE_CARD.artwork.borderRadius,
  },
  
  playingIndicator: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.accentColor,
  },
  
  playingDot: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    backgroundColor: theme.accentColor,
  },
  
  infoContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: theme.textColor,
    lineHeight: TYPOGRAPHY.fontSize.lg * TYPOGRAPHY.lineHeight.normal,
    marginBottom: SPACING.xs,
  },
  
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    color: theme.textColor + 'CC',
    lineHeight: TYPOGRAPHY.fontSize.md * TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: SPACING.sm,
  },
  
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: SPACING.xs,
  },
  
  metadata: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: theme.textColor + '99',
  },
  
  metadataDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.textColor + '66',
    marginHorizontal: SPACING.sm,
  },
  
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: theme.accentColor,
    marginBottom: SPACING.xs,
  },
  
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  
  downloadBadge: {
    backgroundColor: theme.accentColor + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.xs,
  },
  
  downloadText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: theme.accentColor,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
});