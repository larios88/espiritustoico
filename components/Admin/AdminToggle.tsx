/**
 * Admin Toggle Component - Quick toggle for admin mode access
 * Requirements: 5.4, 13.4, 14.2, 14.5
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert
} from 'react-native';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import { AdminLogin } from './AdminLogin';

export interface AdminToggleProps {
  style?: any;
  showLabel?: boolean;
}

export const AdminToggle: React.FC<AdminToggleProps> = ({
  style,
  showLabel = true
}) => {
  const { isAdminMode, logout, isAuthenticated } = useAdmin();
  const { theme } = useTheme();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleToggle = useCallback(async () => {
    if (isAdminMode) {
      // Logout admin
      Alert.alert(
        'Logout Admin',
        'Are you sure you want to logout from admin mode?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              try {
                await logout();
                Alert.alert('Success', 'Logged out from admin mode');
              } catch (error) {
                console.error('Logout error:', error);
                Alert.alert('Error', 'Failed to logout from admin mode');
              }
            }
          }
        ]
      );
    } else {
      // Show login modal
      setShowLoginModal(true);
    }
  }, [isAdminMode, logout]);

  const handleLoginSuccess = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  const handleLoginCancel = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center'
    },
    toggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.textColor,
      backgroundColor: isAdminMode ? theme.textColor : 'transparent'
    },
    toggleText: {
      color: isAdminMode ? theme.backgroundColor : theme.textColor,
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8
    },
    indicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: isAdminMode ? theme.backgroundColor : theme.textColor
    },
    label: {
      color: theme.textColor,
      fontSize: 12,
      marginTop: 4,
      opacity: 0.8
    },
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    modalContent: {
      width: '90%',
      maxWidth: 400,
      backgroundColor: theme.backgroundColor,
      borderRadius: 12,
      padding: 0,
      overflow: 'hidden'
    }
  });

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <View style={styles.indicator} />
        <Text style={styles.toggleText}>
          {isAdminMode ? 'Admin Mode' : 'Admin Login'}
        </Text>
      </TouchableOpacity>
      
      {showLabel && (
        <Text style={styles.label}>
          {isAdminMode ? 'Tap to logout' : 'Tap to login'}
        </Text>
      )}

      <Modal
        visible={showLoginModal}
        animationType="fade"
        transparent={true}
        onRequestClose={handleLoginCancel}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <AdminLogin
              onLoginSuccess={handleLoginSuccess}
              onCancel={handleLoginCancel}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};