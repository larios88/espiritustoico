/**
 * Episode Info Component
 * Displays episode metadata and action buttons
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';

import { Episode } from '../../types/episode';
import { ThemeConfig } from '../../types/theme';
import { BookmarkCreateData } from '../../types/bookmark';
import { BookmarkButton } from '../Bookmarks';
import { SnippetButton } from '../Snippets';
import { formatDuration, formatDate } from '../../utils/timeUtils';

export interface EpisodeInfoProps {
  episode: Episode;
  theme: ThemeConfig;
  expanded?: boolean;
  onBookmarksPress?: () => void;
  onCreateBookmark?: (data: BookmarkCreateData) => Promise<void>;
  onCreateSnippet?: () => void;
  onShowTranscription?: () => void;
  currentPosition?: number;
  onSharePress?: () => void;
  onDownloadPress?: () => void;
  style?: any;
}

export const EpisodeInfo: React.FC<EpisodeInfoProps> = ({
  episode,
  theme,
  expanded = false,
  onBookmarksPress,
  onCreateBookmark,
  onCreateSnippet,
  onShowTranscription,
  currentPosition = 0,
  onSharePress,
  onDownloadPress,
  style
}) => {
  const styles = createStyles(theme, expanded);

  if (!expanded) {
    // Compact view - just title and basic info
    return (
      <View style={[styles.compactContainer, style]}>
        <Text style={styles.compactTitle} numberOfLines={2}>
          {episode.title}
        </Text>
        <Text style={styles.compactMeta}>
          {formatDuration(episode.duration)} • {formatDate(episode.publishDate)}
        </Text>
      </View>
    );
  }

  // Expanded view - full episode information
  return (
    <View style={[styles.expandedContainer, style]}>
      {/* Episode Title */}
      <Text style={styles.expandedTitle} numberOfLines={3}>
        {episode.title}
      </Text>

      {/* Episode Metadata */}
      <View style={styles.metadataContainer}>
        <Text style={styles.metadataText}>
          {formatDuration(episode.duration)}
        </Text>
        <Text style={styles.metadataSeparator}>•</Text>
        <Text style={styles.metadataText}>
          {formatDate(episode.publishDate)}
        </Text>
        {episode.playCount > 0 && (
          <>
            <Text style={styles.metadataSeparator}>•</Text>
            <Text style={styles.metadataText}>
              {episode.playCount} play{episode.playCount !== 1 ? 's' : ''}
            </Text>
          </>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {onCreateBookmark && (
          <BookmarkButton
            theme={theme}
            episodeId={episode.id}
            currentPosition={currentPosition}
            onCreateBookmark={onCreateBookmark}
            style={styles.actionButton}
          />
        )}

        {onCreateSnippet && (
          <SnippetButton
            theme={theme}
            onPress={onCreateSnippet}
            style={styles.actionButton}
          />
        )}

        {onShowTranscription && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onShowTranscription}
            accessibilityLabel="View transcription"
          >
            <Text style={styles.actionIcon}>📄</Text>
            <Text style={styles.actionLabel}>Transcript</Text>
          </TouchableOpacity>
        )}

        {onBookmarksPress && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onBookmarksPress}
            accessibilityLabel="View bookmarks"
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionLabel}>View All</Text>
          </TouchableOpacity>
        )}

        {onSharePress && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onSharePress}
            accessibilityLabel="Share episode"
          >
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionLabel}>Share</Text>
          </TouchableOpacity>
        )}

        {onDownloadPress && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onDownloadPress}
            accessibilityLabel={episode.isDownloaded ? 'Downloaded' : 'Download episode'}
          >
            <Text style={styles.actionIcon}>
              {episode.isDownloaded ? '✓' : '⬇'}
            </Text>
            <Text style={styles.actionLabel}>
              {episode.isDownloaded ? 'Downloaded' : 'Download'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Episode Description */}
      {episode.description && (
        <ScrollView 
          style={styles.descriptionContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.descriptionTitle}>About this episode</Text>
          <Text style={styles.descriptionText}>
            {episode.description}
          </Text>
        </ScrollView>
      )}
    </View>
  );
};

const createStyles = (theme: ThemeConfig, expanded: boolean) => StyleSheet.create({
  // Compact styles
  compactContainer: {
    paddingVertical: 8,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textColor,
    marginBottom: 4,
  },
  compactMeta: {
    fontSize: 12,
    color: theme.textColor + 'CC',
  },

  // Expanded styles
  expandedContainer: {
    paddingVertical: 16,
  },
  expandedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.textColor,
    lineHeight: 32,
    marginBottom: 12,
    textAlign: 'center',
  },
  metadataContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  metadataText: {
    fontSize: 14,
    color: theme.textColor + 'CC',
    fontWeight: '500',
  },
  metadataSeparator: {
    fontSize: 14,
    color: theme.textColor + '80',
    marginHorizontal: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 20,
    backgroundColor: theme.textColor + '10',
    minWidth: 80,
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 12,
    color: theme.textColor,
    fontWeight: '500',
  },
  descriptionContainer: {
    maxHeight: 120,
    marginTop: 8,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textColor,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: theme.textColor + 'DD',
    lineHeight: 20,
  },
});