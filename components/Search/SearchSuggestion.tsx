/**
 * Search Suggestion Component
 * Individual search suggestion with highlighted text
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

import { Episode } from '../../types/episode';
import { ThemeConfig } from '../../types/theme';
import { formatDuration } from '../../utils/timeUtils';

export interface SearchSuggestionProps {
  episode: Episode;
  theme: ThemeConfig;
  query: string;
  onPress: () => void;
  style?: any;
}

export const SearchSuggestion = (props: SearchSuggestionProps) => {
  const {
    episode,
    theme,
    query,
    onPress,
    style
  } = props;

  // Highlight matching text in title
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => {
      const isMatch = part.toLowerCase() === highlight.toLowerCase();
      return (
        <Text
          key={index}
          style={isMatch ? styles.highlightedText : undefined}
        >
          {part}
        </Text>
      );
    });
  };

  const styles = createStyles(theme);

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Episode Artwork */}
      <Image
        source={{ uri: episode.artwork }}
        style={styles.artwork}
        resizeMode="cover"
      />

      {/* Episode Info */}
      <View style={styles.infoContainer}>
        {/* Title with highlighting */}
        <Text style={styles.title} numberOfLines={2}>
          {highlightText(episode.title, query)}
        </Text>

        {/* Metadata */}
        <View style={styles.metadataContainer}>
          <Text style={styles.metadata}>
            {formatDuration(episode.duration)}
          </Text>
          {episode.playCount > 0 && (
            <>
              <Text style={styles.metadataSeparator}>•</Text>
              <Text style={styles.metadata}>
                {episode.playCount} play{episode.playCount !== 1 ? 's' : ''}
              </Text>
            </>
          )}
        </View>

        {/* Description preview */}
        <Text style={styles.description} numberOfLines={1}>
          {episode.description}
        </Text>
      </View>

      {/* Search Icon */}
      <View style={styles.searchIcon}>
        <Text style={styles.searchIconText}>↗</Text>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: ThemeConfig) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.textColor + '10',
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textColor,
    lineHeight: 20,
    marginBottom: 2,
  },
  highlightedText: {
    backgroundColor: theme.accentColor + '30',
    color: theme.accentColor,
    fontWeight: '700',
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  metadata: {
    fontSize: 12,
    color: theme.textColor + '99',
    fontWeight: '500',
  },
  metadataSeparator: {
    fontSize: 12,
    color: theme.textColor + '66',
    marginHorizontal: 4,
  },
  description: {
    fontSize: 12,
    color: theme.textColor + 'CC',
    lineHeight: 16,
  },
  searchIcon: {
    marginLeft: 8,
    padding: 4,
  },
  searchIconText: {
    fontSize: 16,
    color: theme.textColor + '66',
  },
});