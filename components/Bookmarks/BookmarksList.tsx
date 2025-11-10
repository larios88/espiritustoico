/**
 * Bookmarks List Component
 * Displays list of bookmarks for an episode with search functionality
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

import { Bookmark, BookmarkUpdateData, searchBookmarks, sortBookmarksByTimestamp } from '../../types/bookmark';
import { ThemeConfig } from '../../types/theme';
import { BookmarkItem } from './BookmarkItem';

export interface BookmarksListProps {
  bookmarks: Bookmark[];
  theme: ThemeConfig;
  onJumpTo: (timestamp: number) => void;
  onEdit: (bookmarkId: string, updates: BookmarkUpdateData) => Promise<void>;
  onDelete: (bookmarkId: string) => Promise<void>;
  onClose?: () => void;
  style?: any;
}

export const BookmarksList: React.FC<BookmarksListProps> = ({
  bookmarks,
  theme,
  onJumpTo,
  onEdit,
  onDelete,
  onClose,
  style
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort bookmarks
  const filteredBookmarks = useMemo(() => {
    const filtered = searchQuery.trim() 
      ? searchBookmarks(bookmarks, searchQuery)
      : bookmarks;
    
    return sortBookmarksByTimestamp(filtered);
  }, [bookmarks, searchQuery]);

  const handleJumpToAndClose = (timestamp: number) => {
    onJumpTo(timestamp);
    if (onClose) {
      onClose();
    }
  };

  const renderBookmarkItem = ({ item }: { item: Bookmark }) => (
    <BookmarkItem
      bookmark={item}
      theme={theme}
      onJumpTo={handleJumpToAndClose}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔖</Text>
      <Text style={styles.emptyTitle}>No bookmarks yet</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery.trim() 
          ? 'No bookmarks match your search'
          : 'Add bookmarks while listening to save your favorite moments'
        }
      </Text>
    </View>
  );

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Bookmarks</Text>
        {onClose && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Close bookmarks"
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search bar */}
      {bookmarks.length > 0 && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search bookmarks..."
            placeholderTextColor={theme.textColor + '80'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search bookmarks"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
              accessibilityLabel="Clear search"
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Bookmarks count */}
      {filteredBookmarks.length > 0 && (
        <Text style={styles.countText}>
          {filteredBookmarks.length} bookmark{filteredBookmarks.length !== 1 ? 's' : ''}
          {searchQuery.trim() && ` found`}
        </Text>
      )}

      {/* Bookmarks list */}
      <FlatList
        data={filteredBookmarks}
        renderItem={renderBookmarkItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const createStyles = (theme: ThemeConfig) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.textColor + '20',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textColor,
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 18,
    color: theme.textColor,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: theme.textColor + '10',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    color: theme.textColor,
  },
  clearButton: {
    position: 'absolute',
    right: 32,
    padding: 8,
  },
  clearIcon: {
    fontSize: 14,
    color: theme.textColor + '80',
  },
  countText: {
    fontSize: 12,
    color: theme.textColor + 'CC',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textColor,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.textColor + 'CC',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
});