/**
 * Search Results Component
 * Displays search results with highlighting and empty states
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet
} from 'react-native';

import { Episode } from '../../types/episode';
import { ThemeConfig } from '../../types/theme';
import { EpisodeCard } from '../EpisodeList/EpisodeCard';

export interface SearchResultsProps {
  episodes: Episode[];
  query: string;
  theme: ThemeConfig;
  onEpisodeSelect: (episode: Episode) => void;
  onEpisodePlay?: (episode: Episode) => void;
  currentEpisodeId?: string;
  isLoading?: boolean;
  style?: any;
}

export const SearchResults = (props: SearchResultsProps) => {
  const {
    episodes,
    query,
    theme,
    onEpisodeSelect,
    onEpisodePlay,
    currentEpisodeId,
    isLoading = false,
    style
  } = props;

  const renderEpisode = ({ item }: { item: Episode }) => (
    <EpisodeCard
      episode={item}
      theme={theme}
      isPlaying={currentEpisodeId === item.id}
      onPress={() => onEpisodeSelect(item)}
      onPlayPress={onEpisodePlay ? () => onEpisodePlay(item) : undefined}
    />
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.textColor }]}>
            Searching...
          </Text>
        </View>
      );
    }

    if (!query.trim()) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: theme.textColor }]}>
            Search Episodes
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textColor + 'CC' }]}>
            Find episodes by title, description, or content
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyTitle, { color: theme.textColor }]}>
          No episodes found
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.textColor + 'CC' }]}>
          Try searching with different keywords
        </Text>
        <Text style={[styles.queryText, { color: theme.textColor + '99' }]}>
          Searched for: "{query}"
        </Text>
      </View>
    );
  };

  const renderHeader = () => {
    if (!query.trim() || episodes.length === 0) return null;

    return (
      <View style={styles.headerContainer}>
        <Text style={[styles.headerText, { color: theme.textColor }]}>
          {episodes.length} result{episodes.length !== 1 ? 's' : ''} for "{query}"
        </Text>
      </View>
    );
  };

  const renderSeparator = () => (
    <View style={[styles.separator, { backgroundColor: theme.textColor + '10' }]} />
  );

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={episodes}
        renderItem={renderEpisode}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={renderSeparator}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={episodes.length === 0 ? styles.emptyContentContainer : undefined}
      />
    </View>
  );
};

const createStyles = (theme: ThemeConfig) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.textColor + '10',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  emptyContentContainer: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  queryText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});