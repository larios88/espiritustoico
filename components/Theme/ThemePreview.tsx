/**
 * Theme Preview Component
 * Shows real-time preview of theme changes
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet
} from 'react-native';

import { ThemeConfig } from '../../types/theme';

export interface ThemePreviewProps {
  theme: ThemeConfig;
  style?: any;
}

export const ThemePreview = (props: ThemePreviewProps) => {
  const { theme, style } = props;

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Preview</Text>
      
      <View style={styles.previewCard}>
        {/* Mock Episode Card */}
        <View style={styles.episodeCard}>
          <View style={styles.artwork} />
          
          <View style={styles.episodeInfo}>
            <Text style={styles.episodeTitle} numberOfLines={2}>
              Sample Episode Title
            </Text>
            <Text style={styles.episodeDescription} numberOfLines={2}>
              This is how your episode descriptions will look with the selected theme colors.
            </Text>
            <Text style={styles.episodeMetadata}>
              45:30 • 2 days ago • 12 plays
            </Text>
          </View>
        </View>

        {/* Mock Player Controls */}
        <View style={styles.playerControls}>
          <View style={styles.controlButton}>
            <Text style={styles.controlIcon}>⏪</Text>
          </View>
          
          <View style={styles.playButton}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
          
          <View style={styles.controlButton}>
            <Text style={styles.controlIcon}>⏩</Text>
          </View>
        </View>

        {/* Mock Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>15:30</Text>
            <Text style={styles.progressText}>45:30</Text>
          </View>
        </View>

        {/* Color Swatches */}
        <View style={styles.swatchContainer}>
          <View style={styles.swatchRow}>
            <View style={[styles.swatch, { backgroundColor: theme.backgroundColor }]} />
            <Text style={styles.swatchLabel}>Background</Text>
          </View>
          
          <View style={styles.swatchRow}>
            <View style={[styles.swatch, { backgroundColor: theme.textColor }]} />
            <Text style={styles.swatchLabel}>Text</Text>
          </View>
          
          <View style={styles.swatchRow}>
            <View style={[styles.swatch, { backgroundColor: theme.accentColor }]} />
            <Text style={styles.swatchLabel}>Accent</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: ThemeConfig) => StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textColor,
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: theme.backgroundColor,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: theme.textColor + '20',
  },
  
  // Episode Card Preview
  episodeCard: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  artwork: {
    width: 60,
    height: 60,
    backgroundColor: theme.accentColor,
    borderRadius: 8,
    marginRight: 12,
  },
  episodeInfo: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textColor,
    marginBottom: 4,
  },
  episodeDescription: {
    fontSize: 14,
    color: theme.textColor + 'CC',
    lineHeight: 20,
    marginBottom: 6,
  },
  episodeMetadata: {
    fontSize: 12,
    color: theme.textColor + '99',
  },
  
  // Player Controls Preview
  playerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.textColor + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  controlIcon: {
    fontSize: 18,
    color: theme.textColor,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.accentColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  playIcon: {
    fontSize: 24,
    color: theme.backgroundColor,
    fontWeight: 'bold',
  },
  
  // Progress Bar Preview
  progressContainer: {
    marginBottom: 20,
  },
  progressTrack: {
    height: 4,
    backgroundColor: theme.textColor + '20',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    width: '35%',
    height: '100%',
    backgroundColor: theme.accentColor,
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 12,
    color: theme.textColor + 'CC',
  },
  
  // Color Swatches
  swatchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  swatchRow: {
    alignItems: 'center',
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: theme.textColor + '30',
  },
  swatchLabel: {
    fontSize: 12,
    color: theme.textColor + '99',
    textAlign: 'center',
  },
});