/**
 * Snippet Modal Component
 * Modal wrapper for snippet creation and sharing
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  SafeAreaView
} from 'react-native';

import { SnippetCreateData, generateShareText } from '../../types/snippet';
import { ThemeConfig } from '../../types/theme';
import { SnippetCreator } from './SnippetCreator';
import { ShareOptions } from './ShareOptions';

export interface SnippetModalProps {
  visible: boolean;
  theme: ThemeConfig;
  episodeId: string;
  episodeTitle: string;
  episodeDuration: number;
  currentPosition: number;
  onCreateSnippet: (data: SnippetCreateData) => Promise<void>;
  onClose: () => void;
}

type ModalState = 'create' | 'share';

export const SnippetModal: React.FC<SnippetModalProps> = ({
  visible,
  theme,
  episodeId,
  episodeTitle,
  episodeDuration,
  currentPosition,
  onCreateSnippet,
  onClose
}) => {
  const [modalState, setModalState] = useState<ModalState>('create');
  const [createdSnippet, setCreatedSnippet] = useState<any>(null);

  const handleCreateSnippet = async (data: SnippetCreateData) => {
    try {
      await onCreateSnippet(data);
      
      // Create a temporary snippet object for sharing
      const snippet = {
        id: 'temp',
        ...data,
        duration: data.endTimestamp - data.startTimestamp,
        createdAt: new Date()
      };
      
      setCreatedSnippet(snippet);
      setModalState('share');
    } catch (error) {
      console.error('Failed to create snippet:', error);
      throw error;
    }
  };

  const handleShare = (platform: string) => {
    console.log(`Shared snippet on ${platform}`);
  };

  const handleClose = () => {
    setModalState('create');
    setCreatedSnippet(null);
    onClose();
  };

  const shareText = createdSnippet 
    ? generateShareText(createdSnippet, episodeTitle)
    : '';

  const styles = createStyles(theme);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        
        <View style={styles.content}>
          {modalState === 'create' ? (
            <SnippetCreator
              theme={theme}
              episodeId={episodeId}
              episodeDuration={episodeDuration}
              currentPosition={currentPosition}
              onCreateSnippet={handleCreateSnippet}
              onCancel={handleClose}
            />
          ) : (
            <ShareOptions
              theme={theme}
              shareText={shareText}
              onShare={handleShare}
              onClose={handleClose}
            />
          )}
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
    backgroundColor: theme.backgroundColor,
    marginTop: 60,
    marginHorizontal: 20,
    borderRadius: 20,
    maxHeight: '80%',
  },
});