/**
 * Bookmark Item Component
 * Individual bookmark display with edit/delete functionality
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';

import { Bookmark, BookmarkUpdateData } from '../../types/bookmark';
import { ThemeConfig } from '../../types/theme';
import { formatBookmarkTimestamp } from '../../types/bookmark';

export interface BookmarkItemProps {
  bookmark: Bookmark;
  theme: ThemeConfig;
  onJumpTo: (timestamp: number) => void;
  onEdit: (bookmarkId: string, updates: BookmarkUpdateData) => Promise<void>;
  onDelete: (bookmarkId: string) => Promise<void>;
  style?: any;
}

export const BookmarkItem: React.FC<BookmarkItemProps> = ({
  bookmark,
  theme,
  onJumpTo,
  onEdit,
  onDelete,
  style
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleJumpTo = () => {
    onJumpTo(bookmark.timestamp);
  };

  const handleEdit = () => {
    Alert.prompt(
      'Edit Bookmark',
      'Edit the bookmark note:',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Save',
          onPress: async (newNote) => {
            if (newNote !== undefined && newNote !== bookmark.note) {
              setIsEditing(true);
              try {
                await onEdit(bookmark.id, { note: newNote });
              } catch (error) {
                console.error('Failed to edit bookmark:', error);
                Alert.alert('Error', 'Failed to edit bookmark. Please try again.');
              } finally {
                setIsEditing(false);
              }
            }
          }
        }
      ],
      'plain-text',
      bookmark.note
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Bookmark',
      'Are you sure you want to delete this bookmark?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDelete(bookmark.id);
            } catch (error) {
              console.error('Failed to delete bookmark:', error);
              Alert.alert('Error', 'Failed to delete bookmark. Please try again.');
            }
          }
        }
      ]
    );
  };

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, style]}>
      {/* Main content - tappable to jump to timestamp */}
      <TouchableOpacity
        style={styles.mainContent}
        onPress={handleJumpTo}
        accessibilityLabel={`Jump to ${formatBookmarkTimestamp(bookmark.timestamp)}`}
        accessibilityHint="Tap to jump to this bookmark position"
      >
        <View style={styles.timestampContainer}>
          <Text style={styles.timestamp}>
            {formatBookmarkTimestamp(bookmark.timestamp)}
          </Text>
        </View>
        
        <View style={styles.noteContainer}>
          <Text style={styles.note} numberOfLines={2}>
            {bookmark.note}
          </Text>
          <Text style={styles.createdAt}>
            {formatCreatedAt(bookmark.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Action buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleEdit}
          disabled={isEditing}
          accessibilityLabel="Edit bookmark"
        >
          <Text style={styles.actionIcon}>✏️</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDelete}
          accessibilityLabel="Delete bookmark"
        >
          <Text style={styles.actionIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const formatCreatedAt = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const createStyles = (theme: ThemeConfig) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.backgroundColor,
    borderRadius: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: theme.textColor + '20',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
  },
  timestampContainer: {
    justifyContent: 'center',
    marginRight: 16,
    minWidth: 60,
  },
  timestamp: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.accentColor,
    textAlign: 'center',
  },
  noteContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  note: {
    fontSize: 14,
    color: theme.textColor,
    lineHeight: 20,
    marginBottom: 4,
  },
  createdAt: {
    fontSize: 12,
    color: theme.textColor + 'CC',
  },
  actionsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingRight: 12,
  },
  actionButton: {
    padding: 8,
    marginVertical: 2,
  },
  actionIcon: {
    fontSize: 16,
  },
});