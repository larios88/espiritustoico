/**
 * Advertisement Banner Component
 * Displays banner ads with customizable borders
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';

import { 
  AdContent, 
  BorderConfiguration, 
  generateBorderCSS 
} from '../../types/advertisement';
import { ThemeConfig } from '../../types/theme';

export interface AdBannerProps {
  adContent: AdContent;
  theme: ThemeConfig;
  onAdClick?: () => void;
  onAdImpression?: () => void;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const AdBanner = (props: AdBannerProps) => {
  const {
    adContent,
    theme,
    onAdClick,
    onAdImpression,
    style
  } = props;

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);

  // Track impression when banner becomes visible
  React.useEffect(() => {
    if (isLoaded && !hasTrackedImpression && onAdImpression) {
      onAdImpression();
      setHasTrackedImpression(true);
    }
  }, [isLoaded, hasTrackedImpression, onAdImpression]);

  const handleAdPress = useCallback(() => {
    if (onAdClick) {
      onAdClick();
    }
  }, [onAdClick]);

  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
  }, []);

  // Generate border styles from configuration
  const borderStyles = generateBorderCSS(adContent.borderConfig);

  const styles = createStyles(theme, adContent.borderConfig);

  // Don't render if ad is not active
  if (!adContent.isActive) {
    return null;
  }

  // Render error state
  if (hasError) {
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <Text style={styles.errorText}>Ad failed to load</Text>
      </View>
    );
  }

  // Determine if content is an image URL or HTML/text
  const isImageAd = adContent.content.startsWith('http') && 
    (adContent.content.includes('.jpg') || 
     adContent.content.includes('.png') || 
     adContent.content.includes('.gif') ||
     adContent.content.includes('.webp'));

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handleAdPress}
      activeOpacity={0.8}
      accessibilityLabel="Advertisement"
      accessibilityRole="button"
    >
      <View style={[styles.adContent, borderStyles]}>
        {isImageAd ? (
          // Image Advertisement
          <Image
            source={{ uri: adContent.content }}
            style={styles.adImage}
            resizeMode="cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          // Text/HTML Advertisement
          <View style={styles.textAdContainer}>
            <Text style={styles.adText} numberOfLines={3}>
              {adContent.content}
            </Text>
          </View>
        )}

        {/* Loading indicator */}
        {!isLoaded && !hasError && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading ad...</Text>
          </View>
        )}

        {/* Ad label */}
        <View style={styles.adLabel}>
          <Text style={styles.adLabelText}>Ad</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: ThemeConfig, borderConfig: BorderConfiguration) => StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  adContent: {
    backgroundColor: theme.backgroundColor,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    // Border styles will be applied via generateBorderCSS
  },
  adImage: {
    width: '100%',
    height: 120,
  },
  textAdContainer: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  adText: {
    fontSize: 16,
    color: theme.textColor,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.backgroundColor + 'E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: theme.textColor + 'CC',
  },
  errorContainer: {
    backgroundColor: theme.textColor + '10',
    borderWidth: 1,
    borderColor: theme.textColor + '20',
    borderRadius: 8,
    padding: 16,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: theme.textColor + '99',
    textAlign: 'center',
  },
  adLabel: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.textColor + 'CC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adLabelText: {
    fontSize: 10,
    color: theme.backgroundColor,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});