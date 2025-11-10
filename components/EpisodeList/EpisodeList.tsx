/**
 * Episode List Component
 * Displays list of episodes with card-based layout
 */

import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text
} from 'react-native';

import { Episode } from '../../types/episode';
import { ThemeConfig } from '../../types/theme';
import { EpisodeCard } from './EpisodeCard';

export interface EpisodeListProps {
  episodes: Episode[];
  theme: ThemeConfig;
  onEpisodeSelect: (episode: Episode) => void;
  onEpisodePlay?: (episode: Episode) => void;
  currentEpisodeId?: string;
  isLoading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  style?: any;
}

export const EpisodeList = (props: EpisodeListProps) => {
  const {
    episodes,
    theme,
    onEpisodeSelect,
    onEpisodePlay,
    currentEpisodeId,
    isLoading = false,
    refreshing = false,
    onRefresh,
    onEndReached,
    style
  } = props;

  const renderEpisode = ({ item, index }: { item: Episode; index: number }) => (
    <EpisodeCard
      episode={item}
      theme={theme}
      isPlaying={currentEpisodeId === item.id}
      onPress={() => onEpisodeSelect(item)}
      onPlayPress={onEpisodePlay ? () => onEpisodePlay(item) : undefined}
      showIndex={index < 2} // Show index for first two episodes (most recent and most viewed)
      indexLabel={index === 0 ? 'Latest' : index === 1 ? 'Popular' : undefined}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.textColor }]}>
        {isLoading ? 'Loading episodes...' : 'No episodes available'}
      </Text>
    </View>
  );

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
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
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
  separator: {
    height: 1,
    marginHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContentContainer: {
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});