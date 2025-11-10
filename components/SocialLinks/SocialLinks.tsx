/**
 * Social Links Component - Displays social media links for users
 * Requirements: 14.1, 14.3, 14.4, 14.5
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SocialLink } from '../../types/social';
import { socialLinksService } from '../../services/SocialLinksService';

export interface SocialLinksProps {
  /**
   * Layout style for the social links
   */
  layout?: 'horizontal' | 'vertical' | 'grid';
  
  /**
   * Maximum number of links to display
   */
  maxLinks?: number;
  
  /**
   * Show platform names alongside icons
   */
  showLabels?: boolean;
  
  /**
   * Custom styling for the container
   */
  containerStyle?: any;
  
  /**
   * Custom styling for individual link items
   */
  linkStyle?: any;
  
  /**
   * Callback when a link is pressed
   */
  onLinkPress?: (link: SocialLink) => void;
  
  /**
   * Show loading indicator
   */
  showLoading?: boolean;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({
  layout = 'horizontal',
  maxLinks,
  showLabels = false,
  containerStyle,
  linkStyle,
  onLinkPress,
  showLoading = true
}) => {
  const { theme } = useTheme();
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load social links on component mount
  useEffect(() => {
    loadSocialLinks();
  }, []);

  const loadSocialLinks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get only active social links
      const activeLinks = await socialLinksService.getActiveLinks();
      
      // Apply maxLinks limit if specified
      const displayLinks = maxLinks ? activeLinks.slice(0, maxLinks) : activeLinks;
      
      setLinks(displayLinks);
    } catch (err) {
      console.error('Failed to load social links:', err);
      setError('Failed to load social links');
    } finally {
      setIsLoading(false);
    }
  }, [maxLinks]);

  const handleLinkPress = useCallback(async (link: SocialLink) => {
    try {
      // Call custom onLinkPress handler if provided
      if (onLinkPress) {
        onLinkPress(link);
        return;
      }

      // Default behavior: open link in browser
      await socialLinksService.openLink(link.id);
    } catch (err) {
      console.error('Failed to open social link:', err);
      Alert.alert(
        'Error',
        'Failed to open social link. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [onLinkPress]);

  const renderLink = useCallback((link: SocialLink, index: number) => {
    const linkStyles = [
      styles.linkItem,
      layout === 'horizontal' && styles.horizontalLinkItem,
      layout === 'vertical' && styles.verticalLinkItem,
      layout === 'grid' && styles.gridLinkItem,
      linkStyle
    ];

    return (
      <TouchableOpacity
        key={link.id}
        style={linkStyles}
        onPress={() => handleLinkPress(link)}
        activeOpacity={0.7}
        accessibilityLabel={`Open ${link.displayName}`}
        accessibilityHint={`Opens ${link.platform} in your browser`}
        accessibilityRole="button"
      >
        <Image
          source={{ uri: link.iconUrl }}
          style={layout === 'grid' ? styles.gridLinkIcon : styles.linkIcon}
          resizeMode="contain"
          onError={() => {
            console.warn(`Failed to load icon for ${link.platform}: ${link.iconUrl}`);
          }}
        />
        
        {showLabels && (
          <Text 
            style={[
              styles.linkLabel,
              { color: theme.textColor },
              layout === 'horizontal' ? styles.horizontalLinkLabel :
              layout === 'vertical' ? styles.verticalLinkLabel :
              layout === 'grid' ? styles.gridLinkLabel : {}
            ]}
            numberOfLines={layout === 'grid' ? 2 : 1}
            ellipsizeMode="tail"
          >
            {link.displayName}
          </Text>
        )}
      </TouchableOpacity>
    );
  }, [handleLinkPress, showLabels, theme.textColor, layout, linkStyle]);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: 'transparent'
    },
    horizontalContainer: {
      backgroundColor: 'transparent',
      flexDirection: 'row',
      alignItems: 'center'
    },
    verticalContainer: {
      backgroundColor: 'transparent',
      flexDirection: 'column'
    },
    gridContainer: {
      backgroundColor: 'transparent',
      flexDirection: 'row'
    },
    scrollContainer: {
      flex: 1
    },
    linkItem: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
      borderRadius: 8,
      backgroundColor: 'transparent'
    },
    horizontalLinkItem: {
      marginRight: 16,
      minWidth: showLabels ? 80 : 48
    },
    verticalLinkItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginBottom: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: `${theme.textColor}30`,
      borderRadius: 12
    },
    gridLinkItem: {
      width: '30%',
      marginBottom: 16,
      minHeight: showLabels ? 80 : 48
    },
    linkIcon: {
      width: 32,
      height: 32,
      borderRadius: 16
    },
    gridLinkIcon: {
      width: 40,
      height: 40,
      borderRadius: 20
    },
    linkLabel: {
      fontSize: 12,
      fontWeight: '500',
      textAlign: 'center'
    },
    horizontalLinkLabel: {
      marginTop: 4,
      maxWidth: 80
    },
    verticalLinkLabel: {
      marginLeft: 12,
      fontSize: 14,
      flex: 1,
      textAlign: 'left'
    },
    gridLinkLabel: {
      marginTop: 6,
      fontSize: 11,
      lineHeight: 14
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center'
    },
    loadingSpinner: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderTopColor: 'transparent',
      borderRightColor: 'transparent'
    },
    loadingText: {
      marginTop: 8,
      fontSize: 14,
      color: theme.textColor,
      opacity: 0.7
    },
    errorContainer: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center'
    },
    errorText: {
      fontSize: 14,
      color: theme.textColor,
      opacity: 0.7,
      textAlign: 'center'
    },
    emptyContainer: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center'
    },
    emptyText: {
      fontSize: 14,
      color: theme.textColor,
      opacity: 0.5,
      textAlign: 'center'
    }
  });

  // Show loading state
  if (isLoading && showLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, containerStyle]}>
        <View style={[styles.loadingSpinner, { borderColor: theme.textColor }]} />
        <Text style={styles.loadingText}>Loading social links...</Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, containerStyle]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={loadSocialLinks}
          style={{ marginTop: 8, padding: 8 }}
        >
          <Text style={[styles.errorText, { textDecorationLine: 'underline' }]}>
            Tap to retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show empty state
  if (links.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer, containerStyle]}>
        <Text style={styles.emptyText}>No social links available</Text>
      </View>
    );
  }

  // Determine container style based on layout
  const getContainerStyles = () => {
    const baseStyles = [styles.container];
    
    if (layout === 'horizontal') {
      baseStyles.push(styles.horizontalContainer);
    } else if (layout === 'vertical') {
      baseStyles.push(styles.verticalContainer);
    } else if (layout === 'grid') {
      baseStyles.push(styles.gridContainer);
    }
    
    if (containerStyle) {
      baseStyles.push(containerStyle);
    }
    
    return baseStyles;
  };

  // For horizontal layout with many items, use ScrollView
  if (layout === 'horizontal' && links.length > 4) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={getContainerStyles()}
      >
        {links.map(renderLink)}
      </ScrollView>
    );
  }

  // For other layouts, use regular View
  return (
    <View style={getContainerStyles()}>
      {links.map(renderLink)}
    </View>
  );
};

export default SocialLinks;