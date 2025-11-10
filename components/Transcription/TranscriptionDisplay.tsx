/**
 * TranscriptionDisplay Component - Shows episode transcription with synchronized highlighting
 * Requirements: 10.1, 10.2, 10.4
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { 
  TranscriptionData, 
  TranscriptionSegment, 
  TranscriptionDisplayOptions,
  formatTranscriptionTime,
  findCurrentSegment
} from '../../types/transcription';
import { transcriptionService } from '../../services/TranscriptionService';
import { audioService } from '../../services/AudioService';
import { useThemeStyles } from '../../hooks/useThemeStyles';

interface TranscriptionDisplayProps {
  episodeId: string;
  currentTime: number;
  onSeekToTime: (time: number) => void;
  displayOptions?: Partial<TranscriptionDisplayOptions>;
  searchQuery?: string;
  isVisible: boolean;
}

const defaultDisplayOptions: TranscriptionDisplayOptions = {
  showTimestamps: true,
  highlightCurrentSegment: true,
  fontSize: 'medium',
  autoScroll: true
};

export const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  episodeId,
  currentTime,
  onSeekToTime,
  displayOptions = {},
  searchQuery = '',
  isVisible
}) => {
  const [transcription, setTranscription] = useState<TranscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSegment, setCurrentSegment] = useState<TranscriptionSegment | null>(null);
  
  const scrollViewRef = useRef<any>(null);
  const segmentRefs = useRef<Map<string, any>>(new Map());
  const themeStyles = useThemeStyles();
  
  const options = { ...defaultDisplayOptions, ...displayOptions };

  // Load transcription data
  useEffect(() => {
    if (!episodeId || !isVisible) return;

    const loadTranscription = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const transcriptionData = await transcriptionService.getTranscription(episodeId);
        
        if (transcriptionData && transcriptionData.isAvailable) {
          setTranscription(transcriptionData);
        } else {
          setError('Transcription not available for this episode');
        }
      } catch (err) {
        console.error('Failed to load transcription:', err);
        setError('Failed to load transcription');
      } finally {
        setIsLoading(false);
      }
    };

    loadTranscription();
  }, [episodeId, isVisible]);

  // Update current segment based on playback position
  useEffect(() => {
    if (!transcription || !options.highlightCurrentSegment) return;

    const segment = findCurrentSegment(transcription.segments, currentTime);
    setCurrentSegment(segment);

    // Auto-scroll to current segment
    if (segment && options.autoScroll) {
      scrollToSegment(segment.id);
    }
  }, [currentTime, transcription, options.highlightCurrentSegment, options.autoScroll]);

  // Scroll to specific segment
  const scrollToSegment = useCallback((segmentId: string) => {
    const segmentRef = segmentRefs.current?.get(segmentId);
    if (segmentRef && scrollViewRef.current) {
      try {
        segmentRef.measureLayout(
          scrollViewRef.current.getInnerViewNode(),
          (x: number, y: number) => {
            scrollViewRef.current?.scrollTo({
              y: Math.max(0, y - 100), // Offset to show some context
              animated: true
            });
          },
          () => {} // Error callback
        );
      } catch (error) {
        console.log('Failed to scroll to segment:', error);
      }
    }
  }, []);

  // Handle segment tap - jump to audio position
  const handleSegmentTap = useCallback((segment: TranscriptionSegment) => {
    onSeekToTime(segment.startTime);
  }, [onSeekToTime]);

  // Get font size style
  const getFontSize = () => {
    switch (options.fontSize) {
      case 'small': return 14;
      case 'large': return 18;
      default: return 16;
    }
  };

  // Highlight search terms in text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const isMatch = regex.test(part);
      if (isMatch) {
        return (
          <Text style={styles.highlightedText}>
            {part}
          </Text>
        );
      }
      return part;
    });
  };

  // Render segment
  const renderSegment = (segment: TranscriptionSegment, index: number) => {
    const isCurrentSegment = currentSegment?.id === segment.id;
    const segmentStyle = [
      styles.segment,
      { fontSize: getFontSize() },
      themeStyles.text,
      isCurrentSegment && options.highlightCurrentSegment && styles.currentSegment
    ];

    return (
      <TouchableOpacity
        key={segment.id}
        onPress={() => handleSegmentTap(segment)}
        style={styles.segmentContainer}

      >
        {options.showTimestamps && (
          <Text style={[styles.timestamp, themeStyles.secondaryText]}>
            {formatTranscriptionTime(segment.startTime)}
          </Text>
        )}
        <Text style={segmentStyle}>
          {searchQuery ? highlightText(segment.text, searchQuery) : segment.text}
        </Text>
      </TouchableOpacity>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent, themeStyles.background]}>
        <Text style={[styles.loadingText, themeStyles.text]}>
          Loading transcription...
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent, themeStyles.background]}>
        <Text style={[styles.errorText, themeStyles.text]}>
          {error}
        </Text>
      </View>
    );
  }

  // No transcription available
  if (!transcription || !transcription.isAvailable) {
    return (
      <View style={[styles.container, styles.centerContent, themeStyles.background]}>
        <Text style={[styles.noTranscriptionText, themeStyles.text]}>
          Transcription unavailable for this episode
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, themeStyles.background]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {transcription.segments.map((segment, index) => 
          renderSegment(segment, index)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Extra space at bottom
  },
  segmentContainer: {
    marginBottom: 12,
    padding: 8,
    borderRadius: 4,
  },
  segment: {
    lineHeight: 24,
    marginTop: 4,
  },
  currentSegment: {
    backgroundColor: 'rgba(159, 128, 105, 0.2)', // Muted orange with transparency
    borderLeftWidth: 3,
    borderLeftColor: '#9f8069',
    paddingLeft: 12,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
  },
  highlightedText: {
    backgroundColor: 'rgba(255, 255, 0, 0.3)',
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  noTranscriptionText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  },
});

/**
 * Escapes special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}