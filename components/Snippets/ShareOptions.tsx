/**
 * Share Options Component
 * Displays sharing options for snippets
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Share
} from 'react-native';

import { ShareOptions as ShareOptionsType } from '../../types/snippet';
import { ThemeConfig } from '../../types/theme';

export interface ShareOptionsProps {
  theme: ThemeConfig;
  shareText: string;
  shareUrl?: string;
  onShare: (platform: ShareOptionsType['platform']) => void;
  onClose: () => void;
  style?: any;
}

export const ShareOptions: React.FC<ShareOptionsProps> = ({
  theme,
  shareText,
  shareUrl,
  onShare,
  onClose,
  style
}) => {
  const handleShare = async (platform: ShareOptionsType['platform']) => {
    try {
      switch (platform) {
        case 'copy':
          // Copy to clipboard functionality would go here
          Alert.alert('Copied', 'Snippet details copied to clipboard');
          break;
          
        case 'more':
          // Use native share sheet
          await Share.share({
            message: shareText,
            url: shareUrl,
          });
          break;
          
        case 'twitter':
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}${shareUrl ? `&url=${encodeURIComponent(shareUrl)}` : ''}`;
          await Linking.openURL(twitterUrl);
          break;
          
        case 'facebook':
          const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl || '')}`;
          await Linking.openURL(facebookUrl);
          break;
          
        case 'whatsapp':
          const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareText)}${shareUrl ? ` ${shareUrl}` : ''}`;
          await Linking.openURL(whatsappUrl);
          break;
          
        case 'email':
          const emailUrl = `mailto:?subject=${encodeURIComponent('Podcast Snippet')}&body=${encodeURIComponent(shareText)}${shareUrl ? `%0A%0A${encodeURIComponent(shareUrl)}` : ''}`;
          await Linking.openURL(emailUrl);
          break;
      }
      
      onShare(platform);
      onClose();
    } catch (error) {
      console.error('Failed to share:', error);
      Alert.alert('Error', 'Failed to share snippet. Please try again.');
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Share Snippet</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          accessibilityLabel="Close share options"
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Share Options */}
      <View style={styles.optionsGrid}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => handleShare('copy')}
          accessibilityLabel="Copy to clipboard"
        >
          <Text style={styles.optionIcon}>📋</Text>
          <Text style={styles.optionLabel}>Copy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => handleShare('more')}
          accessibilityLabel="More sharing options"
        >
          <Text style={styles.optionIcon}>📤</Text>
          <Text style={styles.optionLabel}>More</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => handleShare('twitter')}
          accessibilityLabel="Share on Twitter"
        >
          <Text style={styles.optionIcon}>🐦</Text>
          <Text style={styles.optionLabel}>Twitter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => handleShare('facebook')}
          accessibilityLabel="Share on Facebook"
        >
          <Text style={styles.optionIcon}>📘</Text>
          <Text style={styles.optionLabel}>Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => handleShare('whatsapp')}
          accessibilityLabel="Share on WhatsApp"
        >
          <Text style={styles.optionIcon}>💬</Text>
          <Text style={styles.optionLabel}>WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => handleShare('email')}
          accessibilityLabel="Share via email"
        >
          <Text style={styles.optionIcon}>📧</Text>
          <Text style={styles.optionLabel}>Email</Text>
        </TouchableOpacity>
      </View>

      {/* Preview */}
      <View style={styles.preview}>
        <Text style={styles.previewTitle}>Preview:</Text>
        <Text style={styles.previewText}>{shareText}</Text>
        {shareUrl && (
          <Text style={styles.previewUrl}>{shareUrl}</Text>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: ThemeConfig) => StyleSheet.create({
  container: {
    backgroundColor: theme.backgroundColor,
    padding: 20,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  option: {
    width: '30%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.textColor + '10',
    borderRadius: 12,
    marginBottom: 12,
  },
  optionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textColor,
    textAlign: 'center',
  },
  preview: {
    backgroundColor: theme.textColor + '05',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.textColor + '20',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textColor,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: theme.textColor + 'DD',
    lineHeight: 20,
    marginBottom: 8,
  },
  previewUrl: {
    fontSize: 12,
    color: theme.accentColor,
    fontStyle: 'italic',
  },
});