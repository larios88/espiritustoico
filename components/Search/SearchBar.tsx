/**
 * Search Bar Component
 * Search input with real-time suggestions
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList
} from 'react-native';

import { Episode } from '../../types/episode';
import { ThemeConfig } from '../../types/theme';
import { SearchInput } from './SearchInput';
import { SearchSuggestion } from './SearchSuggestion';

export interface SearchBarProps {
  episodes: Episode[];
  theme: ThemeConfig;
  onSearch: (query: string) => void;
  onEpisodeSelect: (episode: Episode) => void;
  placeholder?: string;
  maxSuggestions?: number;
  style?: any;
}

export const SearchBar = (props: SearchBarProps) => {
  const {
    episodes,
    theme,
    onSearch,
    onEpisodeSelect,
    placeholder = 'Search episodes...',
    maxSuggestions = 5,
    style
  } = props;

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Episode[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Generate suggestions based on query
  const generateSuggestions = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const queryLower = searchQuery.toLowerCase();
    const filtered = episodes
      .filter(episode => {
        const titleMatch = episode.title.toLowerCase().includes(queryLower);
        const descriptionMatch = episode.description.toLowerCase().includes(queryLower);
        const transcriptionMatch = episode.transcription?.toLowerCase().includes(queryLower);
        
        return titleMatch || descriptionMatch || transcriptionMatch;
      })
      .slice(0, maxSuggestions);

    setSuggestions(filtered);
  }, [episodes, maxSuggestions]);

  // Update suggestions when query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateSuggestions(query);
    }, 150); // Debounce suggestions

    return () => clearTimeout(timeoutId);
  }, [query, generateSuggestions]);

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    onSearch(newQuery);
  }, [onSearch]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setShowSuggestions(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for suggestion selection
    setTimeout(() => setShowSuggestions(false), 150);
  }, []);

  const handleSuggestionSelect = useCallback((episode: Episode) => {
    setQuery(episode.title);
    setShowSuggestions(false);
    onEpisodeSelect(episode);
  }, [onEpisodeSelect]);

  const handleClear = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    onSearch('');
  }, [onSearch]);

  const renderSuggestion = ({ item }: { item: Episode }) => (
    <SearchSuggestion
      episode={item}
      theme={theme}
      query={query}
      onPress={() => handleSuggestionSelect(item)}
    />
  );

  const styles = createStyles(theme, isFocused);

  return (
    <View style={[styles.container, style]}>
      <SearchInput
        value={query}
        onChangeText={handleQueryChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClear={handleClear}
        placeholder={placeholder}
        theme={theme}
        isFocused={isFocused}
      />

      {/* Suggestions Modal */}
      <Modal
        visible={showSuggestions && suggestions.length > 0}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowSuggestions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSuggestions(false)}
        >
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const createStyles = (theme: ThemeConfig, isFocused: boolean) => StyleSheet.create({
  container: {
    position: 'relative',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 100, // Adjust based on search bar position
    paddingHorizontal: 16,
  },
  suggestionsContainer: {
    backgroundColor: theme.backgroundColor,
    borderRadius: 12,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: theme.textColor + '20',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});