/**
 * Border Customizer Component
 * Interface for customizing advertisement border styles
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';

import { 
  BorderConfiguration, 
  BorderStyle, 
  DEFAULT_BORDER_CONFIG,
  createBorderStyle,
  validateBorderConfiguration 
} from '../../types/advertisement';
import { ThemeConfig, validateHexColor } from '../../types/theme';
import { HexColorInput } from '../Theme/HexColorInput';

export interface BorderCustomizerProps {
  borderConfig: BorderConfiguration;
  onBorderChange: (config: BorderConfiguration) => void;
  theme: ThemeConfig;
  style?: any;
}

type BorderSide = 'top' | 'right' | 'bottom' | 'left';
type BorderStyleType = 'solid' | 'dashed' | 'dotted';

export const BorderCustomizer = (props: BorderCustomizerProps) => {
  const {
    borderConfig,
    onBorderChange,
    theme,
    style
  } = props;

  const [selectedSide, setSelectedSide] = useState<BorderSide>('top');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validate border configuration
  React.useEffect(() => {
    const validation = validateBorderConfiguration(borderConfig);
    setValidationErrors(validation.errors);
  }, [borderConfig]);

  const handleBorderStyleChange = useCallback((
    side: BorderSide,
    property: keyof BorderStyle,
    value: any
  ) => {
    const newBorderConfig = {
      ...borderConfig,
      [side]: {
        ...borderConfig[side],
        [property]: value
      }
    };

    onBorderChange(newBorderConfig);
  }, [borderConfig, onBorderChange]);

  const handleWidthChange = useCallback((side: BorderSide, width: string) => {
    const numericWidth = parseInt(width, 10);
    if (!isNaN(numericWidth) && numericWidth >= 0) {
      handleBorderStyleChange(side, 'width', numericWidth);
    }
  }, [handleBorderStyleChange]);

  const handleColorChange = useCallback((side: BorderSide, color: string) => {
    const validation = validateHexColor(color);
    if (validation.isValid) {
      handleBorderStyleChange(side, 'color', color);
    }
  }, [handleBorderStyleChange]);

  const handleStyleTypeChange = useCallback((side: BorderSide, styleType: BorderStyleType) => {
    handleBorderStyleChange(side, 'style', styleType);
  }, [handleBorderStyleChange]);

  const handleResetBorders = useCallback(() => {
    onBorderChange(DEFAULT_BORDER_CONFIG);
  }, [onBorderChange]);

  const handleApplyToAll = useCallback(() => {
    const selectedBorder = borderConfig[selectedSide];
    const newConfig: BorderConfiguration = {
      top: { ...selectedBorder },
      right: { ...selectedBorder },
      bottom: { ...selectedBorder },
      left: { ...selectedBorder }
    };
    onBorderChange(newConfig);
  }, [borderConfig, selectedSide, onBorderChange]);

  const renderBorderSideControls = (side: BorderSide) => {
    const border = borderConfig[side];
    const isSelected = selectedSide === side;

    return (
      <View key={side} style={[styles.sideContainer, isSelected && styles.sideContainerSelected]}>
        <TouchableOpacity
          style={styles.sideHeader}
          onPress={() => setSelectedSide(side)}
        >
          <Text style={[styles.sideTitle, { color: theme.textColor }]}>
            {side.charAt(0).toUpperCase() + side.slice(1)} Border
          </Text>
          <Text style={[styles.sidePreview, { color: theme.textColor + 'CC' }]}>
            {border.width}px {border.style} {border.color}
          </Text>
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.sideControls}>
            {/* Width Control */}
            <View style={styles.controlRow}>
              <Text style={[styles.controlLabel, { color: theme.textColor }]}>Width (px)</Text>
              <View style={styles.widthControls}>
                {[0, 1, 2, 3, 4, 5].map(width => (
                  <TouchableOpacity
                    key={width}
                    style={[
                      styles.widthButton,
                      border.width === width && styles.widthButtonSelected,
                      { borderColor: theme.textColor + '40' }
                    ]}
                    onPress={() => handleWidthChange(side, width.toString())}
                  >
                    <Text style={[
                      styles.widthButtonText,
                      { color: border.width === width ? theme.accentColor : theme.textColor }
                    ]}>
                      {width}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Color Control */}
            <View style={styles.controlRow}>
              <Text style={[styles.controlLabel, { color: theme.textColor }]}>Color</Text>
              <View style={styles.colorControls}>
                <View 
                  style={[
                    styles.colorSwatch, 
                    { backgroundColor: border.color, borderColor: theme.textColor + '40' }
                  ]} 
                />
                <HexColorInput
                  value={border.color}
                  onChangeText={(color) => handleColorChange(side, color)}
                  theme={theme}
                  style={styles.colorInput}
                />
              </View>
            </View>

            {/* Style Control */}
            <View style={styles.controlRow}>
              <Text style={[styles.controlLabel, { color: theme.textColor }]}>Style</Text>
              <View style={styles.styleControls}>
                {(['solid', 'dashed', 'dotted'] as BorderStyleType[]).map(styleType => (
                  <TouchableOpacity
                    key={styleType}
                    style={[
                      styles.styleButton,
                      border.style === styleType && styles.styleButtonSelected,
                      { borderColor: theme.textColor + '40' }
                    ]}
                    onPress={() => handleStyleTypeChange(side, styleType)}
                  >
                    <Text style={[
                      styles.styleButtonText,
                      { color: border.style === styleType ? theme.accentColor : theme.textColor }
                    ]}>
                      {styleType}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, style]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Border Customization</Text>
          <Text style={styles.subtitle}>
            Customize individual border sides with different colors, thickness, and styles
          </Text>
        </View>

        {/* Preview */}
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Preview</Text>
          <View style={[
            styles.previewBox,
            {
              borderTopWidth: borderConfig.top.width,
              borderTopColor: borderConfig.top.color,
              borderTopStyle: borderConfig.top.style as any,
              borderRightWidth: borderConfig.right.width,
              borderRightColor: borderConfig.right.color,
              borderRightStyle: borderConfig.right.style as any,
              borderBottomWidth: borderConfig.bottom.width,
              borderBottomColor: borderConfig.bottom.color,
              borderBottomStyle: borderConfig.bottom.style as any,
              borderLeftWidth: borderConfig.left.width,
              borderLeftColor: borderConfig.left.color,
              borderLeftStyle: borderConfig.left.style as any,
            }
          ]}>
            <Text style={[styles.previewText, { color: theme.textColor }]}>
              Advertisement Preview
            </Text>
          </View>
        </View>

        {/* Border Controls */}
        <View style={styles.controlsContainer}>
          {(['top', 'right', 'bottom', 'left'] as BorderSide[]).map(renderBorderSideControls)}
        </View>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <View style={styles.errorsContainer}>
            <Text style={styles.errorsTitle}>Issues:</Text>
            {validationErrors.map((error, index) => (
              <Text key={index} style={styles.errorText}>
                • {error}
              </Text>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleApplyToAll}
          >
            <Text style={[styles.actionButtonText, { color: theme.textColor }]}>
              Apply {selectedSide} to All Sides
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleResetBorders}
          >
            <Text style={[styles.actionButtonText, { color: theme.textColor }]}>
              Reset to Default
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    fontSize: 20,
    fontWeight: '700',
    color: theme.textColor,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textColor + 'CC',
    lineHeight: 20,
  },
  previewContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textColor,
    marginBottom: 12,
  },
  previewBox: {
    backgroundColor: theme.backgroundColor,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '500',
  },
  controlsContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sideContainer: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: theme.textColor + '05',
  },
  sideContainerSelected: {
    backgroundColor: theme.accentColor + '10',
    borderWidth: 1,
    borderColor: theme.accentColor + '40',
  },
  sideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sideTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sidePreview: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  sideControls: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  controlRow: {
    marginBottom: 16,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  widthControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  widthButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  widthButtonSelected: {
    backgroundColor: theme.accentColor + '20',
  },
  widthButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  colorControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 12,
  },
  colorInput: {
    flex: 1,
  },
  styleControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  styleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  styleButtonSelected: {
    backgroundColor: theme.accentColor + '20',
  },
  styleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  errorsContainer: {
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
    marginBottom: 4,
  },
  actions: {
    padding: 20,
    paddingTop: 0,
  },
  actionButton: {
    backgroundColor: theme.textColor + '20',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});