/**
 * Playback Controls Component
 * Audio playback control buttons and rate selector
 * Enhanced with accessibility and animations
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Animated
} from 'react-native';

import { ThemeConfig } from '../../types/theme';
import { PLAYBACK_RATES } from '../../audio/PlayerConfig';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS, AUDIO_PLAYER } from '../../constants/design';
import { createButtonPressEffect } from '../../utils/animations';
import { 
  createButtonAccessibility, 
  createTouchableStyle,
  announceForAccessibility 
} from '../../utils/accessibility';

export interface PlaybackControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  playbackRate: number;
  theme: ThemeConfig;
  onPlayPause: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onPlaybackRateChange: (rate: number) => void;
  expanded?: boolean;
  style?: any;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  isLoading,
  playbackRate,
  theme,
  onPlayPause,
  onSkipForward,
  onSkipBackward,
  onPlaybackRateChange,
  expanded = false,
  style
}) => {
  const [showRateModal, setShowRateModal] = useState(false);

  // Animation effects for buttons
  const { scaleValue: playScale, pressIn: playPressIn, pressOut: playPressOut } = createButtonPressEffect();
  const { scaleValue: skipBackScale, pressIn: skipBackPressIn, pressOut: skipBackPressOut } = createButtonPressEffect();
  const { scaleValue: skipForwardScale, pressIn: skipForwardPressIn, pressOut: skipForwardPressOut } = createButtonPressEffect();
  const { scaleValue: rateScale, pressIn: ratePressIn, pressOut: ratePressOut } = createButtonPressEffect();

  const handleRateSelect = (rate: number) => {
    onPlaybackRateChange(rate);
    setShowRateModal(false);
    announceForAccessibility(`Playback speed changed to ${rate}x`);
  };

  const handlePlayPause = () => {
    onPlayPause();
    announceForAccessibility(isPlaying ? 'Paused' : 'Playing');
  };

  const handleSkipBackward = () => {
    onSkipBackward();
    announceForAccessibility('Skipped backward 30 seconds');
  };

  const handleSkipForward = () => {
    onSkipForward();
    announceForAccessibility('Skipped forward 1 minute');
  };

  const styles = createStyles(theme, expanded);

  return (
    <View style={[styles.container, style]}>
      {/* Playback Rate Button (only in expanded mode) */}
      {expanded && (
        <Animated.View style={[{ transform: [{ scale: rateScale }] }]}>
          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => setShowRateModal(true)}
            onPressIn={ratePressIn}
            onPressOut={ratePressOut}
            {...createButtonAccessibility(
              `Playback rate ${playbackRate}x`,
              'Change playback speed'
            )}
          >
            <Text style={styles.rateText}>{playbackRate}x</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Skip Backward Button */}
      <Animated.View style={[{ transform: [{ scale: skipBackScale }] }]}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkipBackward}
          onPressIn={skipBackPressIn}
          onPressOut={skipBackPressOut}
          {...createButtonAccessibility(
            'Skip backward',
            'Skip backward 30 seconds'
          )}
        >
          <Text style={styles.skipIcon}>⏪</Text>
          {expanded && <Text style={styles.skipLabel}>30s</Text>}
        </TouchableOpacity>
      </Animated.View>

      {/* Play/Pause Button */}
      <Animated.View style={[{ transform: [{ scale: playScale }] }]}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayPause}
          onPressIn={playPressIn}
          onPressOut={playPressOut}
          disabled={isLoading}
          {...createButtonAccessibility(
            isPlaying ? 'Pause' : 'Play',
            `${isPlaying ? 'Pause' : 'Play'} episode`,
            isLoading
          )}
        >
          <Text style={styles.playIcon}>
            {isLoading ? '⟳' : isPlaying ? '⏸' : '▶'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Skip Forward Button */}
      <Animated.View style={[{ transform: [{ scale: skipForwardScale }] }]}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkipForward}
          onPressIn={skipForwardPressIn}
          onPressOut={skipForwardPressOut}
          {...createButtonAccessibility(
            'Skip forward',
            'Skip forward 1 minute'
          )}
        >
          <Text style={styles.skipIcon}>⏩</Text>
          {expanded && <Text style={styles.skipLabel}>1m</Text>}
        </TouchableOpacity>
      </Animated.View>

      {/* Placeholder for balance (only in expanded mode) */}
      {expanded && <View style={styles.rateButton} />}

      {/* Playback Rate Modal */}
      <Modal
        visible={showRateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRateModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRateModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Playback Speed</Text>
            
            <FlatList
              data={PLAYBACK_RATES}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.rateOption,
                    item === playbackRate && styles.rateOptionSelected
                  ]}
                  onPress={() => handleRateSelect(item)}
                >
                  <Text style={[
                    styles.rateOptionText,
                    item === playbackRate && styles.rateOptionTextSelected
                  ]}>
                    {item}x
                  </Text>
                  {item === 1.0 && (
                    <Text style={styles.normalLabel}>Normal</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const createStyles = (theme: ThemeConfig, expanded: boolean) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: expanded ? SPACING.xl : SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  
  rateButton: {
    width: expanded ? AUDIO_PLAYER.controls.buttonSize : 40,
    height: expanded ? AUDIO_PLAYER.controls.buttonSize : 40,
    borderRadius: expanded ? AUDIO_PLAYER.controls.buttonSize / 2 : 20,
    backgroundColor: theme.textColor + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: expanded ? SPACING.md : SPACING.sm,
    ...SHADOWS.small,
  },
  
  rateText: {
    fontSize: expanded ? TYPOGRAPHY.fontSize.md : TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: theme.textColor,
  },
  
  skipButton: {
    width: expanded ? AUDIO_PLAYER.controls.buttonSize : 44,
    height: expanded ? AUDIO_PLAYER.controls.buttonSize : 44,
    borderRadius: expanded ? AUDIO_PLAYER.controls.buttonSize / 2 : 22,
    backgroundColor: theme.textColor + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: expanded ? SPACING.lg : SPACING.sm,
    ...SHADOWS.small,
  },
  
  skipIcon: {
    fontSize: expanded ? TYPOGRAPHY.fontSize.xl : TYPOGRAPHY.fontSize.lg,
    color: theme.textColor,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  
  skipLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: theme.textColor + 'CC',
    marginTop: SPACING.xs / 2,
  },
  
  playButton: {
    width: expanded ? AUDIO_PLAYER.controls.primaryButtonSize : AUDIO_PLAYER.controls.buttonSize,
    height: expanded ? AUDIO_PLAYER.controls.primaryButtonSize : AUDIO_PLAYER.controls.buttonSize,
    borderRadius: expanded ? AUDIO_PLAYER.controls.primaryButtonSize / 2 : AUDIO_PLAYER.controls.buttonSize / 2,
    backgroundColor: theme.accentColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: expanded ? SPACING.xl : SPACING.md,
    ...SHADOWS.large,
  },
  
  playIcon: {
    fontSize: expanded ? TYPOGRAPHY.fontSize.xxxl : TYPOGRAPHY.fontSize.xl,
    color: theme.backgroundColor,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  
  modalContent: {
    backgroundColor: theme.backgroundColor,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    minWidth: 240,
    maxHeight: 400,
    borderWidth: 1,
    borderColor: theme.textColor + '20',
    ...SHADOWS.xl,
  },
  
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: theme.textColor,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  
  rateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginVertical: SPACING.xs / 2,
    minHeight: 48, // Accessibility minimum touch target
  },
  
  rateOptionSelected: {
    backgroundColor: theme.accentColor + '20',
  },
  
  rateOptionText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: theme.textColor,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  
  rateOptionTextSelected: {
    color: theme.accentColor,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  
  normalLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: theme.textColor + 'CC',
    fontWeight: TYPOGRAPHY.fontWeight.regular,
  },
});