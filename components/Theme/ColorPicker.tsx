/**
 * Color Picker Component
 * Modal color picker with predefined colors and custom input
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions
} from 'react-native';

import { ThemeConfig, validateHexColor } from '../../types/theme';
import { HexColorInput } from './HexColorInput';

export interface ColorPickerProps {
  initialColor: string;
  onColorSelect: (color: string) => void;
  onCancel: () => void;
  theme: ThemeConfig;
}

// Predefined color palette
const PRESET_COLORS = [
  // Blacks and Grays
  '#000000', '#1A1A1A', '#2D2D2D', '#404040', '#666666', '#808080',
  
  // Whites and Light Grays
  '#FFFFFF', '#F5F5F5', '#E0E0E0', '#CCCCCC', '#B3B3B3', '#999999',
  
  // Blues
  '#0066CC', '#0080FF', '#3399FF', '#66B2FF', '#99CCFF', '#CCE5FF',
  
  // Greens
  '#006600', '#009900', '#00CC00', '#33FF33', '#66FF66', '#99FF99',
  
  // Reds
  '#CC0000', '#FF0000', '#FF3333', '#FF6666', '#FF9999', '#FFCCCC',
  
  // Oranges
  '#FF6600', '#FF8000', '#FF9933', '#FFB366', '#FFCC99', '#FFE5CC',
  
  // Purples
  '#6600CC', '#8000FF', '#9933FF', '#B366FF', '#CC99FF', '#E5CCFF',
  
  // Yellows
  '#FFCC00', '#FFD700', '#FFDD33', '#FFE666', '#FFEE99', '#FFF5CC',
  
  // Teals and Cyans
  '#006666', '#008080', '#00CCCC', '#33FFFF', '#66FFFF', '#99FFFF',
  
  // Pinks
  '#CC0066', '#FF0080', '#FF3399', '#FF66B2', '#FF99CC', '#FFCCE5',
  
  // Browns and Oranges (Podcast theme colors)
  '#9F8069', '#B8956A', '#D4AF37', '#CD853F', '#DEB887', '#F4A460',
];

const { width: screenWidth } = Dimensions.get('window');
const COLORS_PER_ROW = 6;
const COLOR_SIZE = (screenWidth - 80) / COLORS_PER_ROW;

export const ColorPicker = (props: ColorPickerProps) => {
  const {
    initialColor,
    onColorSelect,
    onCancel,
    theme
  } = props;

  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [customColor, setCustomColor] = useState(initialColor);

  const handlePresetColorSelect = useCallback((color: string) => {
    setSelectedColor(color);
    setCustomColor(color);
  }, []);

  const handleCustomColorChange = useCallback((color: string) => {
    const validation = validateHexColor(color);
    if (validation.isValid) {
      setSelectedColor(color);
      setCustomColor(color);
    }
  }, []);

  const handleConfirm = useCallback(() => {
    onColorSelect(selectedColor);
  }, [selectedColor, onColorSelect]);

  const renderColorItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.colorItem,
        { backgroundColor: item },
        selectedColor === item && styles.colorItemSelected
      ]}
      onPress={() => handlePresetColorSelect(item)}
    >
      {selectedColor === item && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  const styles = createStyles(theme);

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose Color</Text>
          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Color Preview */}
        <View style={styles.previewContainer}>
          <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
          <Text style={styles.colorCode}>{selectedColor}</Text>
        </View>

        {/* Custom Color Input */}
        <View style={styles.customSection}>
          <Text style={styles.sectionTitle}>Custom Color</Text>
          <HexColorInput
            value={customColor}
            onChangeText={handleCustomColorChange}
            theme={theme}
            style={styles.customInput}
          />
        </View>

        {/* Preset Colors */}
        <View style={styles.presetsSection}>
          <Text style={styles.sectionTitle}>Preset Colors</Text>
          <FlatList
            data={PRESET_COLORS}
            renderItem={renderColorItem}
            keyExtractor={(item) => item}
            numColumns={COLORS_PER_ROW}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.colorGrid}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>Select</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: ThemeConfig) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: theme.backgroundColor,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: theme.textColor + '20',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textColor,
  },
  closeButton: {
    fontSize: 18,
    color: theme.textColor + '99',
    padding: 4,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  colorPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: theme.textColor + '40',
  },
  colorCode: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: theme.textColor,
    fontWeight: '600',
  },
  customSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textColor,
    marginBottom: 12,
  },
  customInput: {
    alignSelf: 'center',
  },
  presetsSection: {
    marginBottom: 24,
  },
  colorGrid: {
    alignItems: 'center',
  },
  colorItem: {
    width: COLOR_SIZE - 8,
    height: COLOR_SIZE - 8,
    borderRadius: (COLOR_SIZE - 8) / 2,
    margin: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorItemSelected: {
    borderColor: theme.accentColor,
    borderWidth: 3,
  },
  checkmark: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.textColor + '20',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textColor,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: theme.accentColor,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.backgroundColor,
  },
});