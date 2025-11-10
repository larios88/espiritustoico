/**
 * Social Links Management Component - Admin interface for managing social media links
 * Requirements: 14.2, 14.4, 14.5
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
  Modal,
  Image
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAdminAccess } from '../../hooks/useAdminAccess';
import { AdminProtected } from './AdminProtected';
import { SocialLink } from '../../types/social';

// Mock social links service - in real app this would be imported
class SocialLinksService {
  private links: SocialLink[] = [
    {
      id: '1',
      platform: 'YouTube',
      url: 'https://youtube.com/@podcast',
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/174/174883.png',
      displayName: 'YouTube Channel',
      order: 1,
      isActive: true
    },
    {
      id: '2',
      platform: 'Spotify',
      url: 'https://open.spotify.com/show/podcast',
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/174/174872.png',
      displayName: 'Spotify Podcast',
      order: 2,
      isActive: true
    }
  ];

  async getAllLinks(): Promise<SocialLink[]> {
    return [...this.links].sort((a, b) => a.order - b.order);
  }

  async createLink(linkData: Omit<SocialLink, 'id'>): Promise<SocialLink> {
    const newLink: SocialLink = {
      ...linkData,
      id: Date.now().toString()
    };
    this.links.push(newLink);
    return newLink;
  }

  async updateLink(id: string, updates: Partial<SocialLink>): Promise<void> {
    const index = this.links.findIndex(link => link.id === id);
    if (index !== -1) {
      this.links[index] = { ...this.links[index], ...updates };
    }
  }

  async deleteLink(id: string): Promise<void> {
    this.links = this.links.filter(link => link.id !== id);
  }

  async reorderLinks(links: SocialLink[]): Promise<void> {
    links.forEach((link, index) => {
      const existingIndex = this.links.findIndex(l => l.id === link.id);
      if (existingIndex !== -1) {
        this.links[existingIndex].order = index + 1;
      }
    });
  }
}

const socialLinksService = new SocialLinksService();

export const SocialLinksManagement: React.FC = () => {
  const { theme } = useTheme();
  const { requireAdminAccess } = useAdminAccess();
  
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);

  // Load social links
  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = useCallback(async () => {
    try {
      setIsLoading(true);
      const loadedLinks = await socialLinksService.getAllLinks();
      setLinks(loadedLinks);
    } catch (error) {
      console.error('Failed to load social links:', error);
      Alert.alert('Error', 'Failed to load social links');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreateLink = useCallback(() => {
    try {
      requireAdminAccess('social_links', 'create');
      setEditingLink(null);
      setShowCreateModal(true);
    } catch (error) {
      Alert.alert('Access Denied', error.message);
    }
  }, [requireAdminAccess]);

  const handleEditLink = useCallback((link: SocialLink) => {
    try {
      requireAdminAccess('social_links', 'update');
      setEditingLink(link);
      setShowCreateModal(true);
    } catch (error) {
      Alert.alert('Access Denied', error.message);
    }
  }, [requireAdminAccess]);

  const handleDeleteLink = useCallback(async (linkId: string) => {
    try {
      requireAdminAccess('social_links', 'delete');
      
      Alert.alert(
        'Delete Social Link',
        'Are you sure you want to delete this social link?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await socialLinksService.deleteLink(linkId);
                await loadLinks();
                Alert.alert('Success', 'Social link deleted successfully');
              } catch (error) {
                console.error('Delete link error:', error);
                Alert.alert('Error', 'Failed to delete social link');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Access Denied', error.message);
    }
  }, [requireAdminAccess, loadLinks]);

  const handleToggleLink = useCallback(async (linkId: string, isActive: boolean) => {
    try {
      requireAdminAccess('social_links', 'update');
      
      await socialLinksService.updateLink(linkId, { isActive });
      await loadLinks();
    } catch (error) {
      console.error('Toggle link error:', error);
      Alert.alert('Error', 'Failed to update social link status');
    }
  }, [requireAdminAccess, loadLinks]);

  const handleSaveLink = useCallback(async (linkData: Partial<SocialLink>) => {
    try {
      if (editingLink) {
        await socialLinksService.updateLink(editingLink.id, linkData);
      } else {
        const maxOrder = Math.max(...links.map(l => l.order), 0);
        await socialLinksService.createLink({
          ...linkData,
          order: maxOrder + 1
        } as Omit<SocialLink, 'id'>);
      }
      
      await loadLinks();
      setShowCreateModal(false);
      setEditingLink(null);
      
      Alert.alert('Success', `Social link ${editingLink ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Save link error:', error);
      Alert.alert('Error', `Failed to ${editingLink ? 'update' : 'create'} social link`);
    }
  }, [editingLink, links, loadLinks]);

  const handleMoveUp = useCallback(async (linkId: string) => {
    try {
      requireAdminAccess('social_links', 'update');
      
      const linkIndex = links.findIndex(l => l.id === linkId);
      if (linkIndex > 0) {
        const newLinks = [...links];
        [newLinks[linkIndex], newLinks[linkIndex - 1]] = [newLinks[linkIndex - 1], newLinks[linkIndex]];
        
        await socialLinksService.reorderLinks(newLinks);
        await loadLinks();
      }
    } catch (error) {
      Alert.alert('Access Denied', error.message);
    }
  }, [requireAdminAccess, links, loadLinks]);

  const handleMoveDown = useCallback(async (linkId: string) => {
    try {
      requireAdminAccess('social_links', 'update');
      
      const linkIndex = links.findIndex(l => l.id === linkId);
      if (linkIndex < links.length - 1) {
        const newLinks = [...links];
        [newLinks[linkIndex], newLinks[linkIndex + 1]] = [newLinks[linkIndex + 1], newLinks[linkIndex]];
        
        await socialLinksService.reorderLinks(newLinks);
        await loadLinks();
      }
    } catch (error) {
      Alert.alert('Access Denied', error.message);
    }
  }, [requireAdminAccess, links, loadLinks]);

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
    linkCard: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.textColor,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16
    },
    linkHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12
    },
    linkIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 12
    },
    linkInfo: {
      flex: 1
    },
    linkPlatform: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textColor
    },
    linkDisplayName: {
      fontSize: 14,
      color: theme.textColor,
      opacity: 0.8
    },
    linkStatus: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    statusText: {
      color: theme.textColor,
      marginRight: 8,
      fontSize: 14
    },
    linkUrl: {
      color: theme.textColor,
      fontSize: 12,
      opacity: 0.6,
      marginBottom: 12
    },
    linkActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    orderControls: {
      flexDirection: 'row'
    },
    orderButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: theme.textColor,
      marginHorizontal: 2
    },
    orderButtonText: {
      color: theme.textColor,
      fontSize: 12
    },
    actionButtons: {
      flexDirection: 'row'
    },
    actionButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.textColor,
      marginLeft: 8
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
        <Text style={styles.loadingText}>Loading social links...</Text>
      </View>
    );
  }

  return (
    <AdminProtected resource="social_links" action="read">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Social Links Management</Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateLink}>
            <Text style={styles.createButtonText}>Add Link</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {links.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No social links configured.{'\n'}
                Tap "Add Link" to add your first social media link.
              </Text>
            </View>
          ) : (
            links.map((link, index) => (
              <View key={link.id} style={styles.linkCard}>
                <View style={styles.linkHeader}>
                  <Image
                    source={{ uri: link.iconUrl }}
                    style={styles.linkIcon}
                    defaultSource={{ uri: 'https://via.placeholder.com/32x32/cccccc/666666?text=?' }}
                  />
                  <View style={styles.linkInfo}>
                    <Text style={styles.linkPlatform}>{link.platform}</Text>
                    <Text style={styles.linkDisplayName}>{link.displayName}</Text>
                  </View>
                  <View style={styles.linkStatus}>
                    <Text style={styles.statusText}>
                      {link.isActive ? 'Active' : 'Inactive'}
                    </Text>
                    <Switch
                      value={link.isActive}
                      onValueChange={(value) => handleToggleLink(link.id, value)}
                      trackColor={{ false: '#767577', true: theme.textColor }}
                      thumbColor={link.isActive ? theme.backgroundColor : '#f4f3f4'}
                    />
                  </View>
                </View>

                <Text style={styles.linkUrl} numberOfLines={1}>
                  {link.url}
                </Text>

                <View style={styles.linkActions}>
                  <View style={styles.orderControls}>
                    <TouchableOpacity
                      style={[styles.orderButton, index === 0 && { opacity: 0.5 }]}
                      onPress={() => handleMoveUp(link.id)}
                      disabled={index === 0}
                    >
                      <Text style={styles.orderButtonText}>↑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.orderButton, index === links.length - 1 && { opacity: 0.5 }]}
                      onPress={() => handleMoveDown(link.id)}
                      disabled={index === links.length - 1}
                    >
                      <Text style={styles.orderButtonText}>↓</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => handleEditLink(link)}
                    >
                      <Text style={[styles.actionButtonText, styles.editButtonText]}>
                        Edit
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteLink(link.id)}
                    >
                      <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <SocialLinkFormModal
          visible={showCreateModal}
          link={editingLink}
          onSave={handleSaveLink}
          onCancel={() => {
            setShowCreateModal(false);
            setEditingLink(null);
          }}
        />
      </View>
    </AdminProtected>
  );
};

// Social Link Form Modal Component
interface SocialLinkFormModalProps {
  visible: boolean;
  link: SocialLink | null;
  onSave: (linkData: Partial<SocialLink>) => void;
  onCancel: () => void;
}

const SocialLinkFormModal: React.FC<SocialLinkFormModalProps> = ({
  visible,
  link,
  onSave,
  onCancel
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<Partial<SocialLink>>({
    platform: '',
    url: '',
    iconUrl: '',
    displayName: '',
    isActive: true
  });

  useEffect(() => {
    if (link) {
      setFormData(link);
    } else {
      setFormData({
        platform: '',
        url: '',
        iconUrl: '',
        displayName: '',
        isActive: true
      });
    }
  }, [link]);

  const handleSave = useCallback(() => {
    if (!formData.platform?.trim()) {
      Alert.alert('Error', 'Platform name is required');
      return;
    }
    if (!formData.url?.trim()) {
      Alert.alert('Error', 'URL is required');
      return;
    }
    if (!formData.displayName?.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    // Validate URL format
    try {
      new URL(formData.url);
    } catch {
      Alert.alert('Error', 'Please enter a valid URL');
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
            {link ? 'Edit Social Link' : 'Add Social Link'}
          </Text>

          <View style={modalStyles.formGroup}>
            <Text style={modalStyles.label}>Platform</Text>
            <TextInput
              style={modalStyles.input}
              value={formData.platform}
              onChangeText={(text) => setFormData(prev => ({ ...prev, platform: text }))}
              placeholder="YouTube, Spotify, Instagram, etc."
              placeholderTextColor={`${theme.textColor}60`}
            />
          </View>

          <View style={modalStyles.formGroup}>
            <Text style={modalStyles.label}>Display Name</Text>
            <TextInput
              style={modalStyles.input}
              value={formData.displayName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, displayName: text }))}
              placeholder="My YouTube Channel"
              placeholderTextColor={`${theme.textColor}60`}
            />
          </View>

          <View style={modalStyles.formGroup}>
            <Text style={modalStyles.label}>URL</Text>
            <TextInput
              style={modalStyles.input}
              value={formData.url}
              onChangeText={(text) => setFormData(prev => ({ ...prev, url: text }))}
              placeholder="https://youtube.com/@channel"
              placeholderTextColor={`${theme.textColor}60`}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={modalStyles.formGroup}>
            <Text style={modalStyles.label}>Icon URL</Text>
            <TextInput
              style={modalStyles.input}
              value={formData.iconUrl}
              onChangeText={(text) => setFormData(prev => ({ ...prev, iconUrl: text }))}
              placeholder="https://example.com/icon.png"
              placeholderTextColor={`${theme.textColor}60`}
              autoCapitalize="none"
              autoCorrect={false}
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