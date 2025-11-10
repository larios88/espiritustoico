/**
 * Hex Color Input Component
 * Input field for hexadecimal color codes with validation
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet
} from 'react-native';

import { ThemeConfig, validateHexColor } from '../../types/theme';

export interface HexColorInputProps {
  value: string;
  onChangeText: (color: string) => void;
  theme: ThemeConfig;
  placeholder?: string;
  style?: any;
}

// Simple TextInput placeholder since we don't have it in types
const TextInput = (props: any) => {
  // In a real React Native app, this would be the actual TextInput component
  return null;
};

export const HexColorInput = (props: HexColorInputProps) => {
  const {
    value,
    onChangeText,
    theme,
    placeholder = '#000000',
    style
  } = props;

  const [inputValue, setInputValue] = useState(value);
  const [isValid, setIsValid] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleTextChange = useCallback((text: string) => {
    // Ensure text starts with #
    let formattedText = text;
    if (!formattedText.startsWith('#')) {
      formattedText = '#' + formattedText.replace('#', '');
    }

    // Limit to 7 characters (#RRGGBB)
    formattedText = formattedText.substring(0, 7);

    // Convert to uppercase
    formattedText = formattedText.toUpperCase();

    setInputValue(formattedText);

    // Validate color
    const validation = validateHexColor(formattedText);
    setIsValid(validation.isValid);

    // Only call onChangeText if valid and complete
    if (validation.isValid && formattedText.length === 7) {
      onChangeText(formattedText);
    }
  }, [onChangeText]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    
    // Validate final input
    const validation = validateHexColor(inputValue);
    if (validation.isValid) {
      onChangeText(inputValue);
    } else {
      // Reset to valid value if invalid
      setInputValue(value);
      setIsValid(true);
    }
  }, [inputValue, value, onChangeText]);

  const styles = createStyles(theme, isValid, isFocused);

  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.input}
        value={inputValue}
        onChangeText={handleTextChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={theme.textColor + '66'}
        maxLength={7}
        autoCapitalize="characters"
        autoCorrect={false}
        keyboardType="default"
        selectTextOnFocus={true}
      />
      
      {!isValid && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invalid</Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: ThemeConfig, isValid: boolean, isFocused: boolean) => StyleSheet.create({
  container: {
    position: 'relative',
  },
  input: {
    backgroundColor: theme.textColor + '10',
    borderWidth: 1,
    borderColor: !isValid ? '#FF6B6B' : isFocused ? theme.accentColor : theme.textColor + '30',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'monospace',
    color: theme.textColor,
    textAlign: 'center',
  },
  errorContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  errorText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
});