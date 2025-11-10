import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {useThemeStyles} from '../hooks/useThemeStyles';
import {useAppLifecycle} from '../hooks/useAppLifecycle';
import {PodcastService} from '../services/PodcastService';
import {AudioService} from '../services/AudioService';
import {Episode} from '../types/episode';
import {formatTime} from '../utils/timeUtils';

export const PlaybackRestoration: React.FC = () => {
  const themeStyles = useThemeStyles();
  const {lastPlaybackState, clearLastPlaybackState} = useAppLifecycle();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const podcastService = PodcastService.getInstance();
  const audioService = AudioService.getInstance();

  useEffect(() => {
    if (lastPlaybackState && lastPlaybackState.episodeId) {
      loadEpisodeForRestoration();
    }
  }, [lastPlaybackState]);

  const loadEpisodeForRestoration = async () => {
    try {
      if (!lastPlaybackState?.episodeId) return;

      const episodeData = await podcastService.getEpisodeById(lastPlaybackState.episodeId);
      if (episodeData) {
        setEpisode(episodeData);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Error loading episode for restoration:', error);
      // Clear invalid state
      await clearLastPlaybackState();
    }
  };

  const handleRestore = async () => {
    if (!episode || !lastPlaybackState) return;

    try {
      setIsLoading(true);
      
      // Load the episode
      await audioService.loadEpisode(episode);
      
      // Seek to the saved position
      await audioService.seekTo(lastPlaybackState.position);
      
      // Don't auto-play - let user decide
      
      // Clear the restoration state
      await clearLastPlaybackState();
      setIsVisible(false);
    } catch (error) {
      console.error('Error restoring playback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = async () => {
    await clearLastPlaybackState();
    setIsVisible(false);
  };

  if (!isVisible || !episode || !lastPlaybackState) {
    return null;
  }

  const formattedPosition = formatTime(lastPlaybackState.position);
  const formattedDuration = formatTime(episode.duration);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, {backgroundColor: themeStyles.backgroundColor}]}>
          <View style={styles.header}>
            <Icon 
              name="restore" 
              size={32} 
              color={themeStyles.textColor} 
              style={styles.icon}
            />
            <Text style={[styles.title, {color: themeStyles.textColor}]}>
              Resume Playback?
            </Text>
          </View>

          <View style={styles.content}>
            <Text style={[styles.episodeTitle, {color: themeStyles.textColor}]}>
              {episode.title}
            </Text>
            
            <Text style={[styles.positionText, {color: themeStyles.textColor}]}>
              Resume from {formattedPosition} of {formattedDuration}
            </Text>

            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, {backgroundColor: `${themeStyles.textColor}20`}]}>
                <View 
                  style={[
                    styles.progressFill, 
                    {
                      backgroundColor: themeStyles.textColor,
                      width: `${(lastPlaybackState.position / episode.duration) * 100}%`
                    }
                  ]} 
                />
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.dismissButton]}
              onPress={handleDismiss}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, {color: themeStyles.textColor}]}>
                Start Over
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.restoreButton, {backgroundColor: themeStyles.textColor}]}
              onPress={handleRestore}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, {color: themeStyles.backgroundColor}]}>
                {isLoading ? 'Loading...' : 'Resume'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    marginBottom: 24,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  positionText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 16,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    height: 4,
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  dismissButton: {
    borderWidth: 1,
    borderColor: 'rgba(159, 128, 105, 0.3)',
  },
  restoreButton: {
    // Background color set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});