/**
 * TranscriptionViewer Component - Main transcription interface with display and search
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal
} from 'react-native';
import { TranscriptionDisplay } from './TranscriptionDisplay';
import { TranscriptionSearch } from './TranscriptionSearch';
import { 
  TranscriptionSearchResult, 
  TranscriptionDisplayOptions 
} from '../../types/transcription';
import { audioService } from '../../services/AudioService';
import { useThemeStyles } from '../../hooks/useThemeStyles';

interface TranscriptionViewerProps {
  episodeId: string;
  isVisible: boolean;
  onClose: () => void;
  displayOptions?: Partial<TranscriptionDisplayOptions>;
}

type ViewMode = 'display' | 'search';

export const TranscriptionViewer: React.FC<TranscriptionViewerProps> = ({
  episodeId,
  isVisible,
  onClose,
  displayOptions
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('display');
  const [currentTime, setCurrentTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const themeStyles = useThemeStyles();

  // Listen to audio progress updates
  useEffect(() => {
    const handleProgressUpdate = (progress: any) => {
      setCurrentTime(progress.position);
    };

    if (isVisible) {
      audioService.addEventListener('progressUpdated', handleProgressUpdate);
      return () => {
        audioService.removeEventListener('progressUpdated', handleProgressUpdate);
      };
    }
  }, [isVisible]);

  // Handle seek to time from transcription
  const handleSeekToTime = useCallback(async (time: number) => {
    try {
      await audioService.seekTo(time);
    } catch (error) {
      console.error('Failed to seek to time:', error);
    }
  }, []);

  // Handle search result selection
  const handleSearchResultSelect = useCallback((result: TranscriptionSearchResult) => {
    handleSeekToTime(result.startTime);
    // Switch back to display mode to show the selected segment
    setViewMode('display');
  }, [handleSeekToTime]);

  // Handle search query change
  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Toggle between display and search modes
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'display' ? 'search' : 'display');
  }, []);

  // Close modal and reset state
  const handleClose = () => {
    setViewMode('display');
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, themeStyles.background]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: themeStyles.text.color + '20' }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
          >
            <Text style={[styles.closeButtonText, themeStyles.text]}>✕</Text>
          </TouchableOpacity>

          <Text style={[styles.title, themeStyles.text]}>
            {viewMode === 'display' ? 'Transcription' : 'Search Transcription'}
          </Text>

          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleViewMode}
          >
            <Text style={[styles.toggleButtonText, themeStyles.text]}>
              {viewMode === 'display' ? '🔍' : '📄'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {viewMode === 'display' ? (
            <TranscriptionDisplay
              episodeId={episodeId}
              currentTime={currentTime}
              onSeekToTime={handleSeekToTime}
              displayOptions={displayOptions}
              searchQuery={searchQuery}
              isVisible={isVisible}
            />
          ) : (
            <TranscriptionSearch
              episodeId={episodeId}
              onResultSelect={handleSearchResultSelect}
              onSearchQueryChange={handleSearchQueryChange}
            />
          )}
        </View>

        {/* Footer with current playback info */}
        {viewMode === 'display' && (
          <View style={[styles.footer, { borderTopColor: themeStyles.text.color + '20' }]}>
            <Text style={[styles.footerText, themeStyles.secondaryText]}>
              Tap any text to jump to that moment in the audio
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
    width: 40,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  toggleButton: {
    padding: 8,
    width: 40,
  },
  toggleButtonText: {
    fontSize: 18,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
});