/**
 * Audio Player Component
 * Main audio player interface with controls and episode information
 * Enhanced with Pocket Casts-inspired design and smooth animations
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Animated
} from 'react-native';

import { Episode } from '../../types/episode';
import { ThemeConfig } from '../../types/theme';
import { Bookmark, BookmarkCreateData, BookmarkUpdateData } from '../../types/bookmark';
import { SnippetCreateData } from '../../types/snippet';
import { audioService, AudioState } from '../../services/AudioService';
import { bookmarkService } from '../../services/BookmarkService';
import { snippetService } from '../../services/SnippetService';
import { ProgressBar } from './ProgressBar';
import { PlaybackControls } from './PlaybackControls';
import { EpisodeInfo } from './EpisodeInfo';
import { BookmarkModal } from '../Bookmarks';
import { SnippetModal } from '../Snippets';
import { TranscriptionViewer } from '../Transcription';
import { formatDuration } from '../../utils/timeUtils';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS, AUDIO_PLAYER, LAYOUT } from '../../constants/design';
import { 
  createSlideAnimation, 
  createFadeAnimation, 
  createButtonPressEffect,
  createScaleAnimation 
} from '../../utils/animations';
import { GestureHandler } from '../UI/GestureHandler';
import {
  createAudioPlayerAccessibility,
  createSeekBarAccessibility,
  createButtonAccessibility,
  createTextAccessibility,
  createImageAccessibility,
  createProgressAccessibility,
  announceForAccessibility,
  manageFocus,
} from '../../utils/accessibility';

export interface AudioPlayerProps {
  episode: Episode | null;
  theme: ThemeConfig;
  onEpisodeSelect?: (episode: Episode) => void;
  onShowQueue?: () => void;
  onShowBookmarks?: () => void;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const AudioPlayer = (props: AudioPlayerProps) => {
  const {
    episode,
    theme,
    onEpisodeSelect,
    onShowQueue,
    onShowBookmarks,
    style
  } = props;
  const [audioState, setAudioState] = useState<AudioState>(audioService.getState());
  const [isExpanded, setIsExpanded] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showBookmarksModal, setShowBookmarksModal] = useState(false);
  const [showSnippetModal, setShowSnippetModal] = useState(false);
  const [showTranscriptionModal, setShowTranscriptionModal] = useState(false);

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const artworkScale = useRef(new Animated.Value(1)).current;
  const { scaleValue: compactScale, pressIn, pressOut } = createButtonPressEffect();
  const playButtonRotation = useRef(new Animated.Value(0)).current;

  // Refs for accessibility focus management
  const playButtonRef = useRef<any>(null);
  const seekBarRef = useRef<any>(null);
  const expandButtonRef = useRef<any>(null);

  // Update audio state when service state changes
  useEffect(() => {
    const handleStateChange = () => {
      setAudioState(audioService.getState());
    };

    // Listen to audio service events
    audioService.addEventListener('playbackStateChanged', handleStateChange);
    audioService.addEventListener('progressUpdated', handleStateChange);
    audioService.addEventListener('episodeLoaded', handleStateChange);
    audioService.addEventListener('seeked', handleStateChange);
    audioService.addEventListener('playbackRateChanged', handleStateChange);
    audioService.addEventListener('volumeChanged', handleStateChange);

    return () => {
      audioService.removeEventListener('playbackStateChanged', handleStateChange);
      audioService.removeEventListener('progressUpdated', handleStateChange);
      audioService.removeEventListener('episodeLoaded', handleStateChange);
      audioService.removeEventListener('seeked', handleStateChange);
      audioService.removeEventListener('playbackRateChanged', handleStateChange);
      audioService.removeEventListener('volumeChanged', handleStateChange);
    };
  }, []);

  // Load episode when prop changes
  useEffect(() => {
    if (episode && (!audioState.currentEpisode || audioState.currentEpisode.id !== episode.id)) {
      handleLoadEpisode(episode);
      loadBookmarks(episode.id);
    }
  }, [episode]);

  // Load bookmarks for current episode
  const loadBookmarks = useCallback(async (episodeId: string) => {
    try {
      const episodeBookmarks = await bookmarkService.getEpisodeBookmarks(episodeId);
      setBookmarks(episodeBookmarks);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      setBookmarks([]);
    }
  }, []);

  const handleLoadEpisode = useCallback(async (episodeToLoad: Episode) => {
    try {
      await audioService.loadEpisode(episodeToLoad);
    } catch (error) {
      console.error('Failed to load episode:', error);
    }
  }, []);

  const handlePlayPause = useCallback(async () => {
    try {
      if (audioState.isPlaying) {
        await audioService.pause();
      } else {
        await audioService.play();
      }
    } catch (error) {
      console.error('Failed to toggle playback:', error);
    }
  }, [audioState.isPlaying]);

  const handleSeek = useCallback(async (position: number) => {
    try {
      await audioService.seekTo(position);
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  }, []);

  const handleSkipForward = useCallback(async () => {
    try {
      await audioService.skipForward();
    } catch (error) {
      console.error('Failed to skip forward:', error);
    }
  }, []);

  const handleSkipBackward = useCallback(async () => {
    try {
      await audioService.skipBackward();
    } catch (error) {
      console.error('Failed to skip backward:', error);
    }
  }, []);

  const handleToggleExpanded = useCallback(() => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    // Announce state change for accessibility
    announceForAccessibility(
      newExpandedState ? 'Player expanded' : 'Player collapsed'
    );
    
    // Animate expansion/collapse
    if (newExpandedState) {
      createSlideAnimation(slideAnim, 1, 250).start();
    } else {
      createSlideAnimation(slideAnim, 0, 250).start();
    }
  }, [isExpanded]);

  // Gesture handlers
  const handleSwipeDown = useCallback(() => {
    if (isExpanded) {
      handleToggleExpanded();
    }
  }, [isExpanded, handleToggleExpanded]);

  const handleSwipeUp = useCallback(() => {
    if (!isExpanded) {
      handleToggleExpanded();
    }
  }, [isExpanded, handleToggleExpanded]);

  const handleDoubleTapArtwork = useCallback(() => {
    handlePlayPause();
  }, [handlePlayPause]);

  const handleSwipeLeftOnPlayer = useCallback(() => {
    handleSkipForward();
  }, [handleSkipForward]);

  const handleSwipeRightOnPlayer = useCallback(() => {
    handleSkipBackward();
  }, [handleSkipBackward]);

  const handleCreateBookmark = useCallback(async (data: BookmarkCreateData) => {
    try {
      const newBookmark = await bookmarkService.createBookmark(data);
      setBookmarks(prev => [...prev, newBookmark].sort((a, b) => a.timestamp - b.timestamp));
    } catch (error) {
      console.error('Failed to create bookmark:', error);
      throw error;
    }
  }, []);

  const handleEditBookmark = useCallback(async (bookmarkId: string, updates: BookmarkUpdateData) => {
    try {
      await bookmarkService.updateBookmark(bookmarkId, updates);
      setBookmarks(prev => 
        prev.map(bookmark => 
          bookmark.id === bookmarkId 
            ? { ...bookmark, ...updates }
            : bookmark
        )
      );
    } catch (error) {
      console.error('Failed to edit bookmark:', error);
      throw error;
    }
  }, []);

  const handleDeleteBookmark = useCallback(async (bookmarkId: string) => {
    try {
      await bookmarkService.deleteBookmark(bookmarkId);
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId));
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
      throw error;
    }
  }, []);

  const handleJumpToBookmark = useCallback(async (timestamp: number) => {
    try {
      await audioService.seekTo(timestamp);
      setShowBookmarksModal(false);
    } catch (error) {
      console.error('Failed to jump to bookmark:', error);
    }
  }, []);

  const handleShowBookmarks = useCallback(() => {
    if (onShowBookmarks) {
      onShowBookmarks();
    } else {
      setShowBookmarksModal(true);
    }
  }, [onShowBookmarks]);

  const handleCreateSnippet = useCallback(async (data: SnippetCreateData) => {
    try {
      const snippet = await snippetService.createSnippet(data);
      console.log('Snippet created:', snippet);
    } catch (error) {
      console.error('Failed to create snippet:', error);
      throw error;
    }
  }, []);

  const handleShowSnippet = useCallback(() => {
    setShowSnippetModal(true);
  }, []);

  const handleShowTranscription = useCallback(() => {
    setShowTranscriptionModal(true);
  }, []);

  const currentEpisode = audioState.currentEpisode || episode;

  if (!currentEpisode) {
    return null;
  }

  const styles = createStyles(theme);

  if (isExpanded) {
    return (
      <GestureHandler
        onSwipeDown={handleSwipeDown}
        onSwipeLeft={handleSwipeLeftOnPlayer}
        onSwipeRight={handleSwipeRightOnPlayer}
        style={[styles.expandedContainer, style]}
      >
        <Animated.View style={[styles.expandedContainer, { transform: [{ translateY: slideAnim }] }]}>
          {/* Header */}
          <View style={styles.expandedHeader}>
            <TouchableOpacity 
              ref={expandButtonRef}
              style={styles.collapseButton}
              onPress={handleToggleExpanded}
              {...createButtonAccessibility('Collapse player', 'Returns to mini player view')}
            >
              <Text style={styles.collapseIcon}>▼</Text>
            </TouchableOpacity>
            
            <Text 
              style={styles.expandedTitle} 
              numberOfLines={1}
              {...createTextAccessibility('Now Playing', true)}
            >
              Now Playing
            </Text>
            
            <TouchableOpacity 
              style={styles.queueButton}
              onPress={onShowQueue}
              {...createButtonAccessibility('Show queue', 'View upcoming episodes')}
            >
              <Text style={styles.queueIcon}>☰</Text>
            </TouchableOpacity>
          </View>

          {/* Episode Artwork with Gesture Support */}
          <GestureHandler
            onDoubleTap={handleDoubleTapArtwork}
            style={styles.artworkContainer}
          >
            <Animated.View style={[styles.artworkWrapper, { transform: [{ scale: artworkScale }] }]}>
              <Image
                source={{ uri: currentEpisode.artwork }}
                style={styles.expandedArtwork}
                resizeMode="cover"
                {...createImageAccessibility(`Artwork for ${currentEpisode.title}`)}
              />
            </Animated.View>
          </GestureHandler>

          {/* Episode Info */}
          <EpisodeInfo
            episode={currentEpisode}
            theme={theme}
            expanded={true}
            onBookmarksPress={handleShowBookmarks}
            onCreateBookmark={handleCreateBookmark}
            onCreateSnippet={handleShowSnippet}
            onShowTranscription={handleShowTranscription}
            currentPosition={audioState.position}
          />

          {/* Progress Bar with Accessibility */}
          <View ref={seekBarRef}>
            <ProgressBar
              position={audioState.position}
              duration={audioState.duration}
              bufferedPosition={audioState.bufferedPosition}
              theme={theme}
              onSeek={handleSeek}
              style={styles.expandedProgressBar}
              {...createSeekBarAccessibility(
                audioState.position,
                audioState.duration,
                currentEpisode.title
              )}
            />
          </View>

          {/* Playback Controls */}
          <PlaybackControls
            isPlaying={audioState.isPlaying}
            isLoading={audioState.isLoading}
            playbackRate={audioState.playbackRate}
            theme={theme}
            onPlayPause={handlePlayPause}
            onSkipForward={handleSkipForward}
            onSkipBackward={handleSkipBackward}
            onPlaybackRateChange={(rate: number) => audioService.setPlaybackRate(rate)}
            expanded={true}
            style={styles.expandedControls}
          />

          {/* Bookmark Modal */}
          <BookmarkModal
            visible={showBookmarksModal}
            bookmarks={bookmarks}
            theme={theme}
            onJumpTo={handleJumpToBookmark}
            onEdit={handleEditBookmark}
            onDelete={handleDeleteBookmark}
            onClose={() => setShowBookmarksModal(false)}
          />

          {/* Snippet Modal */}
          <SnippetModal
            visible={showSnippetModal}
            theme={theme}
            episodeId={currentEpisode.id}
            episodeTitle={currentEpisode.title}
            episodeDuration={audioState.duration}
            currentPosition={audioState.position}
            onCreateSnippet={handleCreateSnippet}
            onClose={() => setShowSnippetModal(false)}
          />

          {/* Transcription Modal */}
          <TranscriptionViewer
            episodeId={currentEpisode.id}
            isVisible={showTranscriptionModal}
            onClose={() => setShowTranscriptionModal(false)}
          />
        </Animated.View>
      </GestureHandler>
    );
  }

  // Compact player view
  return (
    <GestureHandler
      onSwipeUp={handleSwipeUp}
      onSwipeLeft={handleSwipeLeftOnPlayer}
      onSwipeRight={handleSwipeRightOnPlayer}
      onPress={handleToggleExpanded}
      style={[styles.compactContainer, style]}
    >
      <Animated.View style={[styles.compactWrapper, { transform: [{ scale: compactScale }] }]}>
        <TouchableOpacity 
          style={styles.compactTouchable}
          onPress={handleToggleExpanded}
          onPressIn={pressIn}
          onPressOut={pressOut}
          activeOpacity={0.9}
          {...createAudioPlayerAccessibility(
            audioState.isPlaying,
            audioState.position,
            audioState.duration,
            currentEpisode.title
          )}
        >
          {/* Episode Artwork */}
          <Image
            source={{ uri: currentEpisode.artwork }}
            style={styles.compactArtwork}
            resizeMode="cover"
            {...createImageAccessibility(`Artwork for ${currentEpisode.title}`)}
          />

          {/* Episode Info */}
          <View style={styles.compactInfo}>
            <Text 
              style={styles.compactTitle} 
              numberOfLines={1}
              {...createTextAccessibility(currentEpisode.title)}
            >
              {currentEpisode.title}
            </Text>
            <Text 
              style={styles.compactProgress}
              {...createTextAccessibility(
                `${formatDuration(audioState.position)} of ${formatDuration(audioState.duration)}`
              )}
            >
              {formatDuration(audioState.position)} / {formatDuration(audioState.duration)}
            </Text>
          </View>

          {/* Play/Pause Button */}
          <TouchableOpacity
            ref={playButtonRef}
            style={styles.compactPlayButton}
            onPress={handlePlayPause}
            {...createButtonAccessibility(
              audioState.isPlaying ? 'Pause' : 'Play',
              `${audioState.isPlaying ? 'Pause' : 'Play'} ${currentEpisode.title}`,
              audioState.isLoading
            )}
          >
            <Animated.Text 
              style={[
                styles.compactPlayIcon,
                { transform: [{ rotate: playButtonRotation }] }
              ]}
            >
              {audioState.isLoading ? '⟳' : audioState.isPlaying ? '⏸' : '▶'}
            </Animated.Text>
          </TouchableOpacity>

          {/* Progress Indicator */}
          <View 
            style={styles.compactProgressContainer}
            {...createProgressAccessibility(
              'Playback progress',
              audioState.position,
              0,
              audioState.duration
            )}
          >
            <Animated.View 
              style={[
                styles.compactProgressBar,
                { 
                  width: audioState.duration > 0 
                    ? `${(audioState.position / audioState.duration) * 100}%` 
                    : '0%' 
                }
              ]} 
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </GestureHandler>
  );
};

const createStyles = (theme: ThemeConfig) => StyleSheet.create({
  // Expanded player styles
  expandedContainer: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  collapseButton: {
    padding: 10,
  },
  collapseIcon: {
    fontSize: 20,
    color: theme.textColor,
  },
  expandedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textColor,
  },
  queueButton: {
    padding: 10,
  },
  queueIcon: {
    fontSize: 20,
    color: theme.textColor,
  },
  artworkContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  artworkWrapper: {
    borderRadius: 12,
    ...SHADOWS.large,
  },
  expandedArtwork: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.8,
    borderRadius: 12,
  },
  expandedProgressBar: {
    marginBottom: 30,
  },
  expandedControls: {
    marginTop: 'auto',
  },

  // Compact player styles
  compactContainer: {
    backgroundColor: theme.backgroundColor,
    borderTopWidth: 1,
    borderTopColor: theme.textColor + '20',
    ...SHADOWS.medium,
  },
  compactWrapper: {
    flex: 1,
  },
  compactTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: LAYOUT.playerHeight.compact,
  },
  compactArtwork: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  compactInfo: {
    flex: 1,
    marginRight: 12,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textColor,
    marginBottom: 4,
  },
  compactProgress: {
    fontSize: 12,
    color: theme.textColor + 'CC',
  },
  compactPlayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.accentColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  compactPlayIcon: {
    fontSize: 18,
    color: theme.backgroundColor,
    fontWeight: 'bold',
  },
  compactProgressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: theme.textColor + '20',
  },
  compactProgressBar: {
    height: '100%',
    backgroundColor: theme.accentColor,
  },
});