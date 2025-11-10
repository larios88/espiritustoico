/**
 * Advertisement Management Component - Admin interface for managing ads
 * Requirements: 5.4, 5.5, 5.6, 13.4
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Switch,
  Modal
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAdminAccess } from '../../hooks/useAdminAccess';
import { AdminProtected } from './AdminProtected';
import { BorderCustomizer } from '../Advertisement/BorderCustomizer';
import { AdContent, BorderConfiguration } from '../../types/advertisement';
import { advertisementService } from '../../services/AdvertisementService';

export const AdManagement: React.FC = () => {
  const { theme } = useTheme();
  const { requireAdminAccess } = useAdminAccess();
  
  const [ads, setAds] = useState<AdContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAd, setEditingAd] = useState<AdContent | null>(null);

  // Load advertisements
  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = useCallback(async () => {
    try {
      setIsLoading(true);
      const loadedAds = await advertisementService.getAllAds();
      setAds(loadedAds);
    } catch (error) {
      console.error('Failed to load ads:', error);
      Alert.alert('Error', 'Failed to load advertisements');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreateAd = useCallback(() => {
    try {
      requireAdminAccess('advertisements', 'create');
      setEditingAd(null);
      setShowCreateModal(true);
    } catch (error) {
      Alert.alert('Access Denied', error.message);
    }
  }, [requireAdminAccess]);

  const handleEditAd = useCallback((ad: AdContent) => {
    try {
      requireAdminAccess('advertisements', 'update');
      setEditingAd(ad);
      setShowCreateModal(true);
    } catch (error) {
      Alert.alert('Access Denied', error.message);
    }
  }, [requireAdminAccess]);

  const handleDeleteAd = useCallback(async (adId: string) => {
    try {
      requireAdminAccess('advertisements', 'delete');
      
      Alert.alert(
        'Delete Advertisement',
        'Are you sure you want to delete this advertisement?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await advertisementService.deleteAd(adId);
                await loadAds();
                Alert.alert('Success', 'Advertisement deleted successfully');
              } catch (error) {
                console.error('Delete ad error:', error);
                Alert.alert('Error', 'Failed to delete advertisement');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Access Denied', error.message);
    }
  }, [requireAdminAccess, loadAds]);

  const handleToggleAd = useCallback(async (adId: string, isActive: boolean) => {
    try {
      requireAdminAccess('advertisements', 'update');
      
      await advertisementService.updateAd(adId, { isActive });
      await loadAds();
    } catch (error) {
      console.error('Toggle ad error:', error);
      Alert.alert('Error', 'Failed to update advertisement status');
    }
  }, [requireAdminAccess, loadAds]);

  const handleSaveAd = useCallback(async (adData: Partial<AdContent>) => {
    try {
      if (editingAd) {
        await advertisementService.updateAd(editingAd.id, adData);
      } else {
        await advertisementService.createAd(adData as Omit<AdContent, 'id'>);
      }
      
      await loadAds();
      setShowCreateModal(false);
      setEditingAd(null);
      
      Alert.alert('Success', `Advertisement ${editingAd ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Save ad error:', error);
      Alert.alert('Error', `Failed to ${editingAd ? 'update' : 'create'} advertisement`);
    }
  }, [editingAd, loadAds]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
      padding: 16
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.textColor
    },
    createButton: {
      backgroundColor: theme.textColor,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8
    },
    createButtonText: {
      color: theme.backgroundColor,
      fontWeight: '600'
    },
    adCard: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.textColor,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16
    },
    adHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12
    },
    adType: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textColor,
      textTransform: 'capitalize'
    },
    adStatus: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    statusText: {
      color: theme.textColor,
      marginRight: 8,
      fontSize: 14
    },
    adContent: {
      color: theme.textColor,
      fontSize: 14,
      marginBottom: 12,
      opacity: 0.8
    },
    adActions: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    actionButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.textColor
    },
    editButton: {
      backgroundColor: 'transparent'
    },
    deleteButton: {
      backgroundColor: '#ff4444',
      borderColor: '#ff4444'
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '600'
    },
    editButtonText: {
      color: theme.textColor
    },
    deleteButtonText: {
      color: '#ffffff'
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40
    },
    emptyText: {
      color: theme.textColor,
      fontSize: 16,
      textAlign: 'center',
      opacity: 0.6
    },
    loadingText: {
      color: theme.textColor,
      textAlign: 'center',
      fontSize: 16,
      marginTop: 20
    }
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading advertisements...</Text>
      </View>
    );
  }

  return (
    <AdminProtected resource="advertisements" action="read">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Advertisement Management</Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateAd}>
            <Text style={styles.createButtonText}>Create Ad</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {ads.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No advertisements configured.{'\n'}
                Tap "Create Ad" to add your first advertisement.
              </Text>
            </View>
          ) : (
            ads.map((ad) => (
              <View key={ad.id} style={styles.adCard}>
                <View style={styles.adHeader}>
                  <Text style={styles.adType}>{ad.type}</Text>
                  <View style={styles.adStatus}>
                    <Text style={styles.statusText}>
                      {ad.isActive ? 'Active' : 'Inactive'}
                    </Text>
                    <Switch
                      value={ad.isActive}
                      onValueChange={(value) => handleToggleAd(ad.id, value)}
                      trackColor={{ false: '#767577', true: theme.textColor }}
                      thumbColor={ad.isActive ? theme.backgroundColor : '#f4f3f4'}
                    />
                  </View>
                </View>

                <Text style={styles.adContent} numberOfLines={3}>
                  {ad.content}
                </Text>

                <View style={styles.adActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEditAd(ad)}
                  >
                    <Text style={[styles.actionButtonText, styles.editButtonText]}>
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteAd(ad.id)}
                  >
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <AdFormModal
          visible={showCreateModal}
          ad={editingAd}
          onSave={handleSaveAd}
          onCancel={() => {
            setShowCreateModal(false);
            setEditingAd(null);
          }}
        />
      </View>
    </AdminProtected>
  );
};

// Ad Form Modal Component
interface AdFormModalProps {
  visible: boolean;
  ad: AdContent | null;
  onSave: (adData: Partial<AdContent>) => void;
  onCancel: () => void;
}

const AdFormModal: React.FC<AdFormModalProps> = ({
  visible,
  ad,
  onSave,
  onCancel
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<Partial<AdContent>>({
    type: 'banner',
    content: '',
    duration: 5,
    skipAfter: 5,
    isActive: true,
    borderConfig: {
      top: { width: 1, color: theme.textColor, style: 'solid' },
      right: { width: 1, color: theme.textColor, style: 'solid' },
      bottom: { width: 1, color: theme.textColor, style: 'solid' },
      left: { width: 1, color: theme.textColor, style: 'solid' }
    }
  });

  useEffect(() => {
    if (ad) {
      setFormData(ad);
    } else {
      setFormData({
        type: 'banner',
        content: '',
        duration: 5,
        skipAfter: 5,
        isActive: true,
        borderConfig: {
          top: { width: 1, color: theme.textColor, style: 'solid' },
          right: { width: 1, color: theme.textColor, style: 'solid' },
          bottom: { width: 1, color: theme.textColor, style: 'solid' },
          left: { width: 1, color: theme.textColor, style: 'solid' }
        }
      });
    }
  }, [ad, theme.textColor]);

  const handleSave = useCallback(() => {
    if (!formData.content?.trim()) {
      Alert.alert('Error', 'Advertisement content is required');
      return;
    }

    onSave(formData);
  }, [formData, onSave]);

  const modalStyles = StyleSheet.create({
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    modalContent: {
      width: '90%',
      maxWidth: 500,
      backgroundColor: theme.backgroundColor,
      borderRadius: 12,
      padding: 20,
      maxHeight: '80%'
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.textColor,
      marginBottom: 20,
      textAlign: 'center'
    },
    formGroup: {
      marginBottom: 16
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textColor,
      marginBottom: 8
    },
    input: {
      borderWidth: 1,
      borderColor: theme.textColor,
      borderRadius: 8,
      padding: 12,
      color: theme.textColor,
      fontSize: 16
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top'
    },
    picker: {
      borderWidth: 1,
      borderColor: theme.textColor,
      borderRadius: 8,
      color: theme.textColor
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20
    },
    button: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 5
    },
    saveButton: {
      backgroundColor: theme.textColor
    },
    cancelButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.textColor
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600'
    },
    saveButtonText: {
      color: theme.backgroundColor
    },
    cancelButtonText: {
      color: theme.textColor
    }
  });

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={modalStyles.modal}>
        <ScrollView style={modalStyles.modalContent} showsVerticalScrollIndicator={false}>
          <Text style={modalStyles.modalTitle}>
            {ad ? 'Edit Advertisement' : 'Create Advertisement'}
          </Text>

          <View style={modalStyles.formGroup}>
            <Text style={modalStyles.label}>Type</Text>
            <TextInput
              style={modalStyles.input}
              value={formData.type}
              onChangeText={(text) => setFormData(prev => ({ ...prev, type: text as any }))}
              placeholder="banner, pre-roll, mid-roll, exit"
              placeholderTextColor={`${theme.textColor}60`}
            />
          </View>

          <View style={modalStyles.formGroup}>
            <Text style={modalStyles.label}>Content</Text>
            <TextInput
              style={[modalStyles.input, modalStyles.textArea]}
              value={formData.content}
              onChangeText={(text) => setFormData(prev => ({ ...prev, content: text }))}
              placeholder="Advertisement content or HTML"
              placeholderTextColor={`${theme.textColor}60`}
              multiline
            />
          </View>

          <View style={modalStyles.formGroup}>
            <Text style={modalStyles.label}>Duration (seconds)</Text>
            <TextInput
              style={modalStyles.input}
              value={formData.duration?.toString()}
              onChangeText={(text) => setFormData(prev => ({ ...prev, duration: parseInt(text) || 5 }))}
              placeholder="5"
              placeholderTextColor={`${theme.textColor}60`}
              keyboardType="numeric"
            />
          </View>

          <View style={modalStyles.formGroup}>
            <Text style={modalStyles.label}>Skip After (seconds)</Text>
            <TextInput
              style={modalStyles.input}
              value={formData.skipAfter?.toString()}
              onChangeText={(text) => setFormData(prev => ({ ...prev, skipAfter: parseInt(text) || 5 }))}
              placeholder="5"
              placeholderTextColor={`${theme.textColor}60`}
              keyboardType="numeric"
            />
          </View>

          <View style={modalStyles.formGroup}>
            <Text style={modalStyles.label}>Border Configuration</Text>
            <BorderCustomizer
              borderConfig={formData.borderConfig!}
              onBorderChange={(borderConfig) => setFormData(prev => ({ ...prev, borderConfig }))}
            />
          </View>

          <View style={modalStyles.buttonContainer}>
            <TouchableOpacity style={[modalStyles.button, modalStyles.cancelButton]} onPress={onCancel}>
              <Text style={[modalStyles.buttonText, modalStyles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[modalStyles.button, modalStyles.saveButton]} onPress={handleSave}>
              <Text style={[modalStyles.buttonText, modalStyles.saveButtonText]}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};