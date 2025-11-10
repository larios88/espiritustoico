/**
 * Bookmark Modal Component
 * Modal wrapper for bookmarks list with backdrop
 */

import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  SafeAreaView
} from 'react-native';

import { Bookmark, BookmarkUpdateData } from '../../types/bookmark';
import { ThemeConfig } from '../../types/theme';
import { BookmarksList } from './BookmarksList';

export interface BookmarkModalProps {
  visible: boolean;
  bookmarks: Bookmark[];
  theme: ThemeConfig;
  onJumpTo: (timestamp: number) => void;
  onEdit: (bookmarkId: string, updates: BookmarkUpdateData) => Promise<void>;
  onDelete: (bookmarkId: string) => Promise<void>;
  onClose: () => void;
}

export const BookmarkModal: React.FC<BookmarkModalProps> = ({
  visible,
  bookmarks,
  theme,
  onJumpTo,
  onEdit,
  onDelete,
  onClose
}) => {
  const styles = createStyles(theme);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        
        <View style={styles.content}>
          <BookmarksList
            bookmarks={bookmarks}
            theme={theme}
            onJumpTo={onJumpTo}
            onEdit={onEdit}
            onDelete={onDelete}
            onClose={onClose}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const createStyles = (theme: ThemeConfig) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});