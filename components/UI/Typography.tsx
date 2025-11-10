/**
 * Typography Components
 * Consistent typography system for Pocket Casts-like design
 */

import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';
import { ThemeConfig } from '../../types/theme';
import { TYPOGRAPHY } from '../../constants/design';

interface BaseTextProps extends TextProps {
  theme: ThemeConfig;
  color?: string;
  align?: 'left' | 'center' | 'right';
  weight?: keyof typeof TYPOGRAPHY.fontWeight;
  children: React.ReactNode;
}

// Heading Components
export interface HeadingProps extends BaseTextProps {
  level?: 1 | 2 | 3 | 4;
}

export const Heading: React.FC<HeadingProps> = ({
  theme,
  level = 1,
  color,
  align = 'left',
  weight,
  style,
  children,
  ...props
}) => {
  const styles = createHeadingStyles(theme, level, color, align, weight);
  
  return (
    <Text style={[styles.heading, style]} {...props}>
      {children}
    </Text>
  );
};

// Body Text Components
export interface BodyTextProps extends BaseTextProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'tertiary';
}

export const BodyText: React.FC<BodyTextProps> = ({
  theme,
  size = 'medium',
  variant = 'primary',
  color,
  align = 'left',
  weight,
  style,
  children,
  ...props
}) => {
  const styles = createBodyTextStyles(theme, size, variant, color, align, weight);
  
  return (
    <Text style={[styles.text, style]} {...props}>
      {children}
    </Text>
  );
};

// Caption Component
export interface CaptionProps extends BaseTextProps {
  variant?: 'default' | 'muted' | 'accent';
}

export const Caption: React.FC<CaptionProps> = ({
  theme,
  variant = 'default',
  color,
  align = 'left',
  weight,
  style,
  children,
  ...props
}) => {
  const styles = createCaptionStyles(theme, variant, color, align, weight);
  
  return (
    <Text style={[styles.caption, style]} {...props}>
      {children}
    </Text>
  );
};

// Label Component
export interface LabelProps extends BaseTextProps {
  variant?: 'default' | 'strong' | 'accent';
}

export const Label: React.FC<LabelProps> = ({
  theme,
  variant = 'default',
  color,
  align = 'left',
  weight,
  style,
  children,
  ...props
}) => {
  const styles = createLabelStyles(theme, variant, color, align, weight);
  
  return (
    <Text style={[styles.label, style]} {...props}>
      {children}
    </Text>
  );
};

// Code Component
export interface CodeProps extends BaseTextProps {}

export const Code: React.FC<CodeProps> = ({
  theme,
  color,
  align = 'left',
  style,
  children,
  ...props
}) => {
  const styles = createCodeStyles(theme, color, align);
  
  return (
    <Text style={[styles.code, style]} {...props}>
      {children}
    </Text>
  );
};

// Style Creators
const createHeadingStyles = (
  theme: ThemeConfig,
  level: number,
  color?: string,
  align?: string,
  weight?: keyof typeof TYPOGRAPHY.fontWeight
) => {
  const getFontSize = () => {
    switch (level) {
      case 1: return TYPOGRAPHY.fontSize.huge;
      case 2: return TYPOGRAPHY.fontSize.xxxl;
      case 3: return TYPOGRAPHY.fontSize.xxl;
      case 4: return TYPOGRAPHY.fontSize.xl;
      default: return TYPOGRAPHY.fontSize.huge;
    }
  };

  const getFontWeight = () => {
    if (weight) return TYPOGRAPHY.fontWeight[weight];
    return level <= 2 ? TYPOGRAPHY.fontWeight.bold : TYPOGRAPHY.fontWeight.semibold;
  };

  return StyleSheet.create({
    heading: {
      fontSize: getFontSize(),
      fontWeight: getFontWeight(),
      color: color || theme.textColor,
      textAlign: align as any,
      lineHeight: getFontSize() * TYPOGRAPHY.lineHeight.tight,
      letterSpacing: TYPOGRAPHY.letterSpacing.tight,
    },
  });
};

const createBodyTextStyles = (
  theme: ThemeConfig,
  size: string,
  variant: string,
  color?: string,
  align?: string,
  weight?: keyof typeof TYPOGRAPHY.fontWeight
) => {
  const getFontSize = () => {
    switch (size) {
      case 'small': return TYPOGRAPHY.fontSize.sm;
      case 'large': return TYPOGRAPHY.fontSize.lg;
      default: return TYPOGRAPHY.fontSize.md;
    }
  };

  const getColor = () => {
    if (color) return color;
    
    switch (variant) {
      case 'secondary': return theme.textColor + 'CC';
      case 'tertiary': return theme.textColor + '99';
      default: return theme.textColor;
    }
  };

  return StyleSheet.create({
    text: {
      fontSize: getFontSize(),
      fontWeight: weight ? TYPOGRAPHY.fontWeight[weight] : TYPOGRAPHY.fontWeight.regular,
      color: getColor(),
      textAlign: align as any,
      lineHeight: getFontSize() * TYPOGRAPHY.lineHeight.normal,
    },
  });
};

const createCaptionStyles = (
  theme: ThemeConfig,
  variant: string,
  color?: string,
  align?: string,
  weight?: keyof typeof TYPOGRAPHY.fontWeight
) => {
  const getColor = () => {
    if (color) return color;
    
    switch (variant) {
      case 'muted': return theme.textColor + '66';
      case 'accent': return theme.accentColor;
      default: return theme.textColor + 'CC';
    }
  };

  return StyleSheet.create({
    caption: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: weight ? TYPOGRAPHY.fontWeight[weight] : TYPOGRAPHY.fontWeight.regular,
      color: getColor(),
      textAlign: align as any,
      lineHeight: TYPOGRAPHY.fontSize.sm * TYPOGRAPHY.lineHeight.normal,
    },
  });
};

const createLabelStyles = (
  theme: ThemeConfig,
  variant: string,
  color?: string,
  align?: string,
  weight?: keyof typeof TYPOGRAPHY.fontWeight
) => {
  const getColor = () => {
    if (color) return color;
    
    switch (variant) {
      case 'strong': return theme.textColor;
      case 'accent': return theme.accentColor;
      default: return theme.textColor + 'CC';
    }
  };

  const getFontWeight = () => {
    if (weight) return TYPOGRAPHY.fontWeight[weight];
    return variant === 'strong' ? TYPOGRAPHY.fontWeight.semibold : TYPOGRAPHY.fontWeight.medium;
  };

  return StyleSheet.create({
    label: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: getFontWeight(),
      color: getColor(),
      textAlign: align as any,
      lineHeight: TYPOGRAPHY.fontSize.md * TYPOGRAPHY.lineHeight.normal,
      letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    },
  });
};

const createCodeStyles = (
  theme: ThemeConfig,
  color?: string,
  align?: string
) => {
  return StyleSheet.create({
    code: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.regular,
      color: color || theme.textColor,
      textAlign: align as any,
      lineHeight: TYPOGRAPHY.fontSize.sm * TYPOGRAPHY.lineHeight.relaxed,
      fontFamily: 'monospace',
      backgroundColor: theme.textColor + '10',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
    },
  });
};