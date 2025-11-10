/**
 * Theme Customizer Component
 * Interface for customizing app theme colors
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal
} from 'react-native';

import { 
  ThemeConfig, 
  DEFAULT_THEME,
  validateThemeConfig,
  validateHexColor,
  validateColorContrast,
  resetToDefaultTheme
} from '../../types/theme';
import { ColorPicker } from './ColorPicker';
import { ThemePreview } from './ThemePreview';
import { HexColorInput } from './HexColorInput';

export interface ThemeCustomizerProps {
  currentTheme: ThemeConfig;
  onThemeChange: (theme: ThemeConfig) => void;
  onSave?: (theme: ThemeConfig) => void;
  onCancel?: () => void;
  style?: any;
}

export const ThemeCustomizer = (props: ThemeCustomizerProps) => {
  const {
    currentTheme,
    onThemeChange,
    onSave,
    onCancel,
    style
  } = props;

  const [workingTheme, setWorkingTheme] = useState<ThemeConfig>(currentTheme);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeColorType, setActiveColorType] = useState<'background' | 'text'>('background');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Update working theme when current theme changes
  useEffect(() => {
    setWorkingTheme(currentTheme);
  }, [currentTheme]);

  // Validate theme and update errors
  useEffect(() => {
    const validation = validateThemeConfig(workingTheme);
    setValidationErrors(validation.errors);
    
    // Apply theme in real-time if valid
    if (validation.isValid) {
      onThemeChange(workingTheme);
    }
  }, [workingTheme, onThemeChange]);

  const handleColorChange = useCallback((color: string, type: 'background' | 'text') => {
    const newTheme: ThemeConfig = {
      ...workingTheme,
      [type === 'background' ? 'backgroundColor' : 'textColor']: color,
      accentColor: type === 'text' ? color : workingTheme.accentColor,
      isCustom: true
    };
    
    setWorkingTheme(newTheme);
  }, [workingTheme]);

  const handleHexInputChange = useCallback((color: string, type: 'background' | 'text') => {
    const validation = validateHexColor(color);
    if (validation.isValid) {
      handleColorChange(color, type);
    }
  }, [handleColorChange]);

  const handleColorPickerOpen = useCallback((type: 'background' | 'text') => {
    setActiveColorType(type);
    setShowColorPicker(true);
  }, []);

  const handleColorPickerSelect = useCallback((color: string) => {
    handleColorChange(color, activeColorType);
    setShowColorPicker(false);
  }, [handleColorChange, activeColorType]);

  const handleReset = useCallback(() => {
    const defaultTheme = resetToDefaultTheme();
    setWorkingTheme(defaultTheme);
  }, []);

  const handleSave = useCallback(() => {
    const validation = validateThemeConfig(workingTheme);
    if (validation.isValid && onSave) {
      onSave(workingTheme);
    }
  }, [workingTheme, onSave]);

  const isValid = validationErrors.length === 0;
  const hasChanges = JSON.stringify(workingTheme) !== JSON.stringify(currentTheme);

  const styles = createStyles(workingTheme);

  return (
    <View style={[styles.container, style]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Customize Theme</Text>
          <Text style={styles.subtitle}>
            Personalize your app colors with hexadecimal codes
          </Text>
        </View>

        {/* Theme Preview */}
        <ThemePreview theme={workingTheme} style={styles.preview} />

        {/* Color Customization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Colors</Text>
          
          {/* Background Color */}
          <View style={styles.colorRow}>
            <View style={styles.colorInfo}>
              <Text style={styles.colorLabel}>Background Color</Text>
              <Text style={styles.colorValue}>{workingTheme.backgroundColor}</Text>
            </View>
            
            <View style={styles.colorControls}>
              <TouchableOpacity
                style={[styles.colorSwatch, { backgroundColor: workingTheme.backgroundColor }]}
                onPress={() => handleColorPickerOpen('background')}
              />
              
              <HexColorInput
                value={workingTheme.backgroundColor}
                onChangeText={(color) => handleHexInputChange(color, 'background')}
                theme={workingTheme}
                style={styles.hexInput}
              />
            </View>
          </View>

          {/* Text Color */}
          <View style={styles.colorRow}>
            <View style={styles.colorInfo}>
              <Text style={styles.colorLabel}>Text Color</Text>
              <Text style={styles.colorValue}>{workingTheme.textColor}</Text>
            </View>
            
            <View style={styles.colorControls}>
              <TouchableOpacity
                style={[styles.colorSwatch, { backgroundColor: workingTheme.textColor }]}
                onPress={() => handleColorPickerOpen('text')}
              />
              
              <HexColorInput
                value={workingTheme.textColor}
                onChangeText={(color) => handleHexInputChange(color, 'text')}
                theme={workingTheme}
                style={styles.hexInput}
              />
            </View>
          </View>
        </View>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <View style={styles.errorsSection}>
            <Text style={styles.errorsTitle}>Issues to Fix:</Text>
            {validationErrors.map((error, index) => (
              <Text key={index} style={styles.errorText}>
                • {error}
              </Text>
            ))}
          </View>
        )}

        {/* Default Theme Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Default Theme</Text>
          <Text style={styles.infoText}>
            Background: {DEFAULT_THEME.backgroundColor} (Black)
          </Text>
          <Text style={styles.infoText}>
            Text: {DEFAULT_THEME.textColor} (Muted Orange)
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
          >
            <Text style={styles.resetButtonText}>Reset to Default</Text>
          </TouchableOpacity>

          <View style={styles.primaryActions}>
            {onCancel && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}

            {onSave && (
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!isValid || !hasChanges) && styles.saveButtonDisabled
                ]}
                onPress={handleSave}
                disabled={!isValid || !hasChanges}
              >
                <Text style={[
                  styles.saveButtonText,
                  (!isValid || !hasChanges) && styles.saveButtonTextDisabled
                ]}>
                  Save Theme
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Color Picker Modal */}
      <Modal
        visible={showColorPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowColorPicker(false)}
      >
        <ColorPicker
          initialColor={activeColorType === 'background' ? workingTheme.backgroundColor : workingTheme.textColor}
          onColorSelect={handleColorPickerSelect}
          onCancel={() => setShowColorPicker(false)}
          theme={workingTheme}
        />
      </Modal>
    </View>
  );
};

const createStyles = (theme: ThemeConfig) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.textColor,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textColor + 'CC',
    lineHeight: 22,
  },
  preview: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textColor,
    marginBottom: 16,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.textColor + '20',
  },
  colorInfo: {
    flex: 1,
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textColor,
    marginBottom: 4,
  },
  colorValue: {
    fontSize: 14,
    color: theme.textColor + '99',
    fontFamily: 'monospace',
  },
  colorControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: theme.textColor + '40',
  },
  hexInput: {
    width: 100,
  },
  errorsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FF6B6B20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B40',
  },
  errorsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    lineHeight: 20,
    marginBottom: 4,
  },
  infoSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    backgroundColor: theme.textColor + '10',
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textColor,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: theme.textColor + 'CC',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  actions: {
    padding: 20,
    paddingTop: 0,
  },
  resetButton: {
    backgroundColor: theme.textColor + '20',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textColor,
  },
  primaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.textColor + '20',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textColor,
  },
  saveButton: {
    flex: 1,
    backgroundColor: theme.accentColor,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonDisabled: {
    backgroundColor: theme.textColor + '20',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.backgroundColor,
  },
  saveButtonTextDisabled: {
    color: theme.textColor + '66',
  },
});