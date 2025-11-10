/**
 * File Upload Component - Admin interface for uploading custom icons
 * Requirements: 14.4, 14.5
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAdminAccess } from '../../hooks/useAdminAccess';

export interface FileUploadProps {
  onFileSelected: (fileUri: string) => void;
  currentFileUri?: string;
  acceptedTypes?: string[];
  maxSizeBytes?: number;
  placeholder?: string;
  style?: any;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelected,
  currentFileUri,
  acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'],
  maxSizeBytes = 5 * 1024 * 1024, // 5MB
  placeholder = 'Tap to select file',
  style
}) => {
  const { theme } = useTheme();
  const { requireAdminAccess } = useAdminAccess();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | undefined>(currentFileUri);

  // Mock file picker - in real app this would use react-native-document-picker
  const selectFile = useCallback(async () => {
    try {
      requireAdminAccess('social_links', 'configure');
      
      // Mock file selection dialog
      Alert.alert(
        'Select File',
        'Choose file source:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Camera',
            onPress: () => handleMockFileSelection('camera')
          },
          {
            text: 'Gallery',
            onPress: () => handleMockFileSelection('gallery')
          },
          {
            text: 'URL',
            onPress: () => handleUrlInput()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Access Denied', error.message);
    }
  }, [requireAdminAccess]);

  const handleMockFileSelection = useCallback(async (source: 'camera' | 'gallery') => {
    try {
      setIsUploading(true);
      
      // Simulate file selection and upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock uploaded file URL
      const mockFileUri = source === 'camera' 
        ? 'https://via.placeholder.com/64x64/4CAF50/ffffff?text=📷'
        : 'https://via.placeholder.com/64x64/2196F3/ffffff?text=🖼️';
      
      setPreviewUri(mockFileUri);
      onFileSelected(mockFileUri);
      
      Alert.alert('Success', 'File uploaded successfully');
    } catch (error) {
      console.error('File upload error:', error);
      Alert.alert('Error', 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  }, [onFileSelected]);

  const handleUrlInput = useCallback(() => {
    Alert.prompt(
      'Enter Image URL',
      'Please enter the URL of the image:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: (url) => {
            if (url && url.trim()) {
              try {
                new URL(url.trim());
                setPreviewUri(url.trim());
                onFileSelected(url.trim());
              } catch {
                Alert.alert('Error', 'Please enter a valid URL');
              }
            }
          }
        }
      ],
      'plain-text',
      currentFileUri || ''
    );
  }, [currentFileUri, onFileSelected]);

  const removeFile = useCallback(() => {
    Alert.alert(
      'Remove File',
      'Are you sure you want to remove this file?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPreviewUri(undefined);
            onFileSelected('');
          }
        }
      ]
    );
  }, [onFileSelected]);

  const styles = StyleSheet.create({
    container: {
      borderWidth: 2,
      borderColor: theme.textColor,
      borderStyle: 'dashed',
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 120,
      backgroundColor: 'transparent'
    },
    uploadButton: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    uploadText: {
      color: theme.textColor,
      fontSize: 16,
      textAlign: 'center',
      marginTop: 8
    },
    uploadSubtext: {
      color: theme.textColor,
      fontSize: 12,
      textAlign: 'center',
      marginTop: 4,
      opacity: 0.7
    },
    previewContainer: {
      alignItems: 'center'
    },
    previewImage: {
      width: 64,
      height: 64,
      borderRadius: 8,
      marginBottom: 8
    },
    previewText: {
      color: theme.textColor,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 8
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'center'
    },
    actionButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.textColor,
      marginHorizontal: 4
    },
    changeButton: {
      backgroundColor: 'transparent'
    },
    removeButton: {
      backgroundColor: '#ff4444',
      borderColor: '#ff4444'
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '600'
    },
    changeButtonText: {
      color: theme.textColor
    },
    removeButtonText: {
      color: '#ffffff'
    },
    loadingContainer: {
      alignItems: 'center'
    },
    loadingText: {
      color: theme.textColor,
      fontSize: 14,
      marginTop: 8
    },
    uploadIcon: {
      fontSize: 32,
      color: theme.textColor,
      opacity: 0.6
    }
  });

  if (isUploading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.textColor} />
          <Text style={styles.loadingText}>Uploading...</Text>
        </View>
      </View>
    );
  }

  if (previewUri) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: previewUri }}
            style={styles.previewImage}
            defaultSource={{ uri: 'https://via.placeholder.com/64x64/cccccc/666666?text=?' }}
          />
          <Text style={styles.previewText}>File selected</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.changeButton]}
              onPress={selectFile}
            >
              <Text style={[styles.actionButtonText, styles.changeButtonText]}>
                Change
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton]}
              onPress={removeFile}
            >
              <Text style={[styles.actionButtonText, styles.removeButtonText]}>
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={selectFile}
      activeOpacity={0.7}
    >
      <View style={styles.uploadButton}>
        <Text style={styles.uploadIcon}>📁</Text>
        <Text style={styles.uploadText}>{placeholder}</Text>
        <Text style={styles.uploadSubtext}>
          Supported: PNG, JPG, GIF{'\n'}
          Max size: {Math.round(maxSizeBytes / (1024 * 1024))}MB
        </Text>
      </View>
    </TouchableOpacity>
  );
};