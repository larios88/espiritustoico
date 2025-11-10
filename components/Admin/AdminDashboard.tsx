/**
 * Admin Dashboard Component - Main admin interface with all management panels
 * Requirements: 5.4, 13.4, 14.2, 14.5
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAdmin } from '../../context/AdminContext';
import { useAdminAccess } from '../../hooks/useAdminAccess';
import { AdminProtected } from './AdminProtected';
import { AdManagement } from './AdManagement';
import { SocialLinksManagement } from './SocialLinksManagement';
import { ThemeCustomizer } from '../Theme/ThemeCustomizer';

type AdminTab = 'overview' | 'advertisements' | 'social_links' | 'theme' | 'settings';

export const AdminDashboard: React.FC = () => {
  const { theme } = useTheme();
  const { session, logout, changePassword } = useAdmin();
  const { 
    canManageAds, 
    canManageSocialLinks, 
    canManageTheme, 
    canManageSettings 
  } = useAdminAccess();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const handleLogout = useCallback(async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from admin mode?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Alert.alert('Success', 'Logged out successfully');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  }, [logout]);

  const handleChangePassword = useCallback(() => {
    Alert.prompt(
      'Current Password',
      'Enter your current password:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Next',
          onPress: (currentPassword?: string) => {
            if (currentPassword) {
              Alert.prompt(
                'New Password',
                'Enter your new password:',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Change',
                    onPress: async (newPassword?: string) => {
                      if (newPassword && newPassword.length >= 6) {
                        try {
                          const success = await changePassword(currentPassword, newPassword);
                          if (success) {
                            Alert.alert('Success', 'Password changed successfully');
                          } else {
                            Alert.alert('Error', 'Current password is incorrect');
                          }
                        } catch (error) {
                          console.error('Change password error:', error);
                          Alert.alert('Error', 'Failed to change password');
                        }
                      } else {
                        Alert.alert('Error', 'New password must be at least 6 characters');
                      }
                    }
                  }
                ],
                'secure-text'
              );
            }
          }
        }
      ],
      'secure-text'
    );
  }, [changePassword]);

  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'advertisements':
        return <AdManagement />;
      case 'social_links':
        return <SocialLinksManagement />;
      case 'theme':
        return <ThemeCustomizer currentTheme={theme} onThemeChange={() => {}} />;
      case 'settings':
        return <AdminSettings onChangePassword={handleChangePassword} />;
      default:
        return <AdminOverview />;
    }
  }, [activeTab, handleChangePassword]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor
    },
    header: {
      backgroundColor: theme.textColor,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.backgroundColor
    },
    headerSubtitle: {
      fontSize: 12,
      color: theme.backgroundColor,
      opacity: 0.8
    },
    logoutButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.backgroundColor
    },
    logoutButtonText: {
      color: theme.backgroundColor,
      fontSize: 12,
      fontWeight: '600'
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: theme.backgroundColor,
      borderBottomWidth: 1,
      borderBottomColor: theme.textColor
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent'
    },
    activeTab: {
      borderBottomColor: theme.textColor
    } as any,
    tabText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textColor,
      opacity: 0.6
    },
    activeTabText: {
      opacity: 1
    } as any,
    content: {
      flex: 1
    }
  });

  const tabs = [
    { id: 'overview' as AdminTab, label: 'Overview', enabled: true },
    { id: 'advertisements' as AdminTab, label: 'Ads', enabled: canManageAds },
    { id: 'social_links' as AdminTab, label: 'Social', enabled: canManageSocialLinks },
    { id: 'theme' as AdminTab, label: 'Theme', enabled: canManageTheme },
    { id: 'settings' as AdminTab, label: 'Settings', enabled: canManageSettings }
  ];

  return (
    <AdminProtected>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Session: {session?.sessionId.slice(-8)}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          {tabs.filter(tab => tab.enabled).map((tab) => (
            <TouchableOpacity
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
              key={tab.id}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>
          {renderTabContent()}
        </View>
      </View>
    </AdminProtected>
  );
};

// Admin Overview Component
const AdminOverview = () => {
  const { theme } = useTheme();
  const { session } = useAdmin();
  const { 
    canManageAds, 
    canManageSocialLinks, 
    canManageTheme, 
    canManageSettings 
  } = useAdminAccess();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.textColor,
      marginBottom: 20
    },
    section: {
      marginBottom: 24
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.textColor,
      marginBottom: 12
    },
    infoCard: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.textColor,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12
    },
    infoLabel: {
      fontSize: 14,
      color: theme.textColor,
      opacity: 0.7,
      marginBottom: 4
    },
    infoValue: {
      fontSize: 16,
      color: theme.textColor,
      fontWeight: '500'
    },
    permissionsList: {
      marginTop: 8
    },
    permissionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4
    },
    permissionIcon: {
      fontSize: 16,
      marginRight: 8
    },
    permissionText: {
      fontSize: 14,
      color: theme.textColor
    }
  });

  const permissions = [
    { label: 'Manage Advertisements', enabled: canManageAds },
    { label: 'Manage Social Links', enabled: canManageSocialLinks },
    { label: 'Manage Theme', enabled: canManageTheme },
    { label: 'Manage Settings', enabled: canManageSettings }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Welcome to Admin Dashboard</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Information</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Session ID</Text>
          <Text style={styles.infoValue}>{session?.sessionId}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Expires At</Text>
          <Text style={styles.infoValue}>
            {session?.expiresAt.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permissions</Text>
        <View style={styles.infoCard}>
          <View style={styles.permissionsList}>
            {permissions.map((permission, index) => {
              const key = `permission-${index}`;
              return (
                <View style={styles.permissionItem} key={key}>
                  <Text style={styles.permissionIcon}>
                    {permission.enabled ? '✅' : '❌'}
                  </Text>
                  <Text style={styles.permissionText}>{permission.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Admin Settings Component
interface AdminSettingsProps {
  onChangePassword: () => void;
}

const AdminSettings = ({ onChangePassword }: AdminSettingsProps) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.textColor,
      marginBottom: 20
    },
    settingCard: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.textColor,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textColor,
      marginBottom: 8
    },
    settingDescription: {
      fontSize: 14,
      color: theme.textColor,
      opacity: 0.7,
      marginBottom: 12
    },
    settingButton: {
      backgroundColor: theme.textColor,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
      alignSelf: 'flex-start'
    },
    settingButtonText: {
      color: theme.backgroundColor,
      fontSize: 14,
      fontWeight: '600'
    }
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Admin Settings</Text>

      <View style={styles.settingCard}>
        <Text style={styles.settingTitle}>Change Password</Text>
        <Text style={styles.settingDescription}>
          Update your admin password for enhanced security
        </Text>
        <TouchableOpacity style={styles.settingButton} onPress={onChangePassword}>
          <Text style={styles.settingButtonText}>Change Password</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingCard}>
        <Text style={styles.settingTitle}>Session Management</Text>
        <Text style={styles.settingDescription}>
          Configure session timeout and security settings
        </Text>
        <TouchableOpacity style={styles.settingButton}>
          <Text style={styles.settingButtonText}>Configure</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};