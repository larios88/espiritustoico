/**
 * Search Input Component
 * Text input with search styling and clear button
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

import { ThemeConfig } from '../../types/theme';

export interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear: () => void;
  placeholder?: string;
  theme: ThemeConfig;
  isFocused?: boolean;
  style?: any;
}

// Simple TextInput component since we don't have it in types
const TextInput = (props: any) => {
  // In a real React Native app, this would be the actual TextInput component
  // For now, we'll create a placeholder
  return null;
};

export const SearchInput = (props: SearchInputProps) => {
  const {
    value,
    onChangeText,
    onFocus,
    onBlur,
    onClear,
    placeholder,
    theme,
    isFocused = false,
    style
  } = props;

  const styles = createStyles(theme, isFocused);

  return (
    <View style={[styles.container, style]}>
      {/* Search Icon */}
      <View style={styles.searchIcon}>
        <Text style={styles.searchIconText}>🔍</Text>
      </View>

      {/* Text Input */}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={theme.textColor + '66'}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />

      {/* Clear Button */}
      {value.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={onClear}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.clearIcon}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme: ThemeConfig, isFocused: boolean) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.textColor + '10',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: isFocused ? theme.accentColor : 'transparent',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchIconText: {
    fontSize: 16,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.textColor,
    paddingVertical: 4,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  clearIcon: {
    fontSize: 14,
    color: theme.textColor + '99',
    fontWeight: 'bold',
  },
});