/**
 * Enhanced Button Component
 * Pocket Casts-inspired button with animations and accessibility
 */

import React, { useRef, useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { ThemeConfig } from '../../types/theme';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS, LAYOUT } from '../../constants/design';
import { createButtonPressEffect } from '../../utils/animations';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  theme: ThemeConfig;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: any;
  textStyle?: any;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  theme,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { scaleValue, pressIn, pressOut } = createButtonPressEffect();
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (disabled || loading) return;
    pressIn();
    Animated.timing(opacityAnim, {
      toValue: 0.8,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [disabled, loading, pressIn]);

  const handlePressOut = useCallback(() => {
    if (disabled || loading) return;
    pressOut();
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [disabled, loading, pressOut]);

  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    onPress();
  }, [disabled, loading, onPress]);

  const styles = createStyles(theme, variant, size, disabled, fullWidth);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.contentContainer}>
          <ActivityIndicator
            size="small"
            color={styles.text.color}
            style={styles.loadingIndicator}
          />
          <Text style={[styles.text, textStyle]}>{title}</Text>
        </View>
      );
    }

    if (icon) {
      return (
        <View style={styles.contentContainer}>
          {iconPosition === 'left' && (
            <View style={styles.iconContainer}>{icon}</View>
          )}
          <Text style={[styles.text, textStyle]}>{title}</Text>
          {iconPosition === 'right' && (
            <View style={styles.iconContainer}>{icon}</View>
          )}
        </View>
      );
    }

    return <Text style={[styles.text, textStyle]}>{title}</Text>;
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleValue }],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{
          disabled: disabled || loading,
          busy: loading,
        }}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const createStyles = (
  theme: ThemeConfig,
  variant: ButtonProps['variant'],
  size: ButtonProps['size'],
  disabled: boolean,
  fullWidth: boolean
) => {
  const getButtonColors = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? theme.textColor + '40' : theme.accentColor,
          borderColor: 'transparent',
          textColor: theme.backgroundColor,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? theme.textColor + '20' : theme.textColor + '20',
          borderColor: 'transparent',
          textColor: disabled ? theme.textColor + '60' : theme.textColor,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: disabled ? theme.textColor + '40' : theme.accentColor,
          textColor: disabled ? theme.textColor + '60' : theme.accentColor,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: disabled ? theme.textColor + '60' : theme.accentColor,
        };
      default:
        return {
          backgroundColor: theme.accentColor,
          borderColor: 'transparent',
          textColor: theme.backgroundColor,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.md,
          minHeight: 36,
          fontSize: TYPOGRAPHY.fontSize.sm,
        };
      case 'large':
        return {
          paddingVertical: SPACING.lg,
          paddingHorizontal: SPACING.xl,
          minHeight: 56,
          fontSize: TYPOGRAPHY.fontSize.lg,
        };
      default: // medium
        return {
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.lg,
          minHeight: LAYOUT.minTouchTarget,
          fontSize: TYPOGRAPHY.fontSize.md,
        };
    }
  };

  const colors = getButtonColors();
  const sizeStyles = getSizeStyles();

  return StyleSheet.create({
    button: {
      backgroundColor: colors.backgroundColor,
      borderWidth: variant === 'outline' ? 1 : 0,
      borderColor: colors.borderColor,
      borderRadius: BORDER_RADIUS.md,
      paddingVertical: sizeStyles.paddingVertical,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      minHeight: sizeStyles.minHeight,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
      ...SHADOWS.small,
      opacity: disabled ? 0.6 : 1,
    },
    
    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    text: {
      fontSize: sizeStyles.fontSize,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textColor,
      textAlign: 'center',
      lineHeight: sizeStyles.fontSize * TYPOGRAPHY.lineHeight.normal,
    },
    
    iconContainer: {
      marginHorizontal: SPACING.xs,
    },
    
    loadingIndicator: {
      marginRight: SPACING.sm,
    },
  });
};