/**
 * TranscriptionSearch Component - Search within episode transcriptions
 * Requirements: 10.3, 10.5
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet
} from 'react-native';
import { 
  TranscriptionSearchResult, 
  TranscriptionSearchOptions,
  formatTranscriptionTime
} from '../../types/transcription';
import { transcriptionService } from '../../services/TranscriptionService';
import { useThemeStyles } from '../../hooks/useThemeStyles';

interface TranscriptionSearchProps {
  episodeId: string;
  onResultSelect: (result: TranscriptionSearchResult) => void;
  onSearchQueryChange?: (query: string) => void;
  placeholder?: string;
  maxResults?: number;
}

interface SearchResultItemProps {
  result: TranscriptionSearchResult;
  onPress: (result: TranscriptionSearchResult) => void;
  themeStyles: any;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ 
  result, 
  onPress, 
  themeStyles 
}) => {
  const handlePress = useCallback(() => {
    onPress(result);
  }, [result, onPress]);

  return (
    <TouchableOpacity
      style={[styles.resultItem, { borderBottomColor: themeStyles.text.color + '20' }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.resultHeader}>
        <Text style={[styles.timestamp, themeStyles.secondaryText]}>
          {formatTranscriptionTime(result.startTime)}
        </Text>
        <Text style={[styles.duration, themeStyles.secondaryText]}>
          {formatTranscriptionTime(result.endTime - result.startTime)} duration
        </Text>
      </View>
      
      <View style={styles.resultContent}>
        {result.contextBefore && (
          <Text style={[styles.context, themeStyles.secondaryText]}>
            ...{result.contextBefore}
          </Text>
        )}
        
        <Text style={[styles.resultText, themeStyles.text]}>
          {/* Render highlighted text - in a real app, you'd parse the HTML */}
          {result.highlightedText.replace(/<mark>/g, '').replace(/<\/mark>/g, '')}
        </Text>
        
        {result.contextAfter && (
          <Text style={[styles.context, themeStyles.secondaryText]}>
            {result.contextAfter}...
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const TranscriptionSearch: React.FC<TranscriptionSearchProps> = ({
  episodeId,
  onResultSelect,
  onSearchQueryChange,
  placeholder = "Search in transcription...",
  maxResults = 20
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TranscriptionSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isTranscriptionAvailable, setIsTranscriptionAvailable] = useState(true);
  const [searchOptions, setSearchOptions] = useState<TranscriptionSearchOptions>({
    query: '',
    caseSensitive: false,
    wholeWords: false,
    maxResults,
    includeContext: true,
    contextLength: 50
  });

  const themeStyles = useThemeStyles();

  // Check transcription availability
  useEffect(() => {
    const checkAvailability = async () => {
      const available = await transcriptionService.isTranscriptionAvailable(episodeId);
      setIsTranscriptionAvailable(available);
    };

    if (episodeId) {
      checkAvailability();
    }
  }, [episodeId]);

  // Debounced search function
  const debouncedSearch = useMemo(() => {
    let timeoutId: any;
    return (query: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        if (!query.trim()) {
          setSearchResults([]);
          setIsSearching(false);
          return;
        }

        setIsSearching(true);
        
        try {
          const options: TranscriptionSearchOptions = {
            ...searchOptions,
            query: query.trim()
          };

          const results = await transcriptionService.searchTranscription(episodeId, options);
          setSearchResults(results);
        } catch (error) {
          console.error('Search failed:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300); // 300ms debounce
    };
  }, [episodeId, searchOptions]);

  // Handle search query change
  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
    onSearchQueryChange?.(query);
    debouncedSearch(query);
  }, [debouncedSearch, onSearchQueryChange]);

  // Handle result selection
  const handleResultSelect = useCallback((result: TranscriptionSearchResult) => {
    onResultSelect(result);
  }, [onResultSelect]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    onSearchQueryChange?.('');
  }, [onSearchQueryChange]);

  // Toggle search options
  const toggleCaseSensitive = useCallback(() => {
    setSearchOptions(prev => ({
      ...prev,
      caseSensitive: !prev.caseSensitive
    }));
    
    // Re-search with new options if there's a query
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    }
  }, [searchQuery, debouncedSearch]);

  const toggleWholeWords = useCallback(() => {
    setSearchOptions(prev => ({
      ...prev,
      wholeWords: !prev.wholeWords
    }));
    
    // Re-search with new options if there's a query
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    }
  }, [searchQuery, debouncedSearch]);

  // Render search result item
  const renderSearchResult = useCallback(({ item }: { item: TranscriptionSearchResult }) => (
    <SearchResultItem
      result={item}
      onPress={handleResultSelect}
      themeStyles={themeStyles}
    />
  ), [handleResultSelect, themeStyles]);

  // If transcription is not available
  if (!isTranscriptionAvailable) {
    return (
      <View style={[styles.container, themeStyles.background]}>
        <View style={styles.unavailableContainer}>
          <Text style={[styles.unavailableText, themeStyles.text]}>
            Transcription search unavailable for this episode
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, themeStyles.background]}>
      {/* Search Input */}
      <View style={[styles.searchContainer, { borderBottomColor: themeStyles.text.color + '20' }]}>
        <TextInput
          style={[styles.searchInput, themeStyles.text, { borderColor: themeStyles.text.color + '30' }]}
          value={searchQuery}
          onChangeText={handleSearchQueryChange}
          placeholder={placeholder}
          placeholderTextColor={themeStyles.text.color + '60'}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearSearch}
          >
            <Text style={[styles.clearButtonText, themeStyles.text]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Options */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            { borderColor: themeStyles.text.color + '30' },
            searchOptions.caseSensitive ? { backgroundColor: themeStyles.text.color + '20' } : {}
          ]}
          onPress={toggleCaseSensitive}
        >
          <Text style={[styles.optionText, themeStyles.text]}>
            Case sensitive
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionButton,
            { borderColor: themeStyles.text.color + '30' },
            searchOptions.wholeWords ? { backgroundColor: themeStyles.text.color + '20' } : {}
          ]}
          onPress={toggleWholeWords}
        >
          <Text style={[styles.optionText, themeStyles.text]}>
            Whole words
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      <View style={styles.resultsContainer}>
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, themeStyles.text]}>Searching...</Text>
          </View>
        ) : searchQuery.trim() && searchResults.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Text style={[styles.noResultsText, themeStyles.text]}>
              No results found for "{searchQuery}"
            </Text>
          </View>
        ) : searchResults.length > 0 ? (
          <>
            <Text style={[styles.resultsCount, themeStyles.secondaryText]}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </Text>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.segmentId}
              showsVerticalScrollIndicator={true}
            />
          </>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 8,
    padding: 8,
  },
  clearButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 16,
    marginRight: 8,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  resultsCount: {
    padding: 16,
    paddingBottom: 8,
    fontSize: 12,
    fontWeight: '500',
  },
  resultItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '600',
  },
  duration: {
    fontSize: 11,
    opacity: 0.7,
  },
  resultContent: {
    marginVertical: 4,
  },
  context: {
    fontSize: 13,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
  },
  unavailableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  unavailableText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  },
});