/**
 * Admin Login Component - Secure login interface for admin access
 * Requirements: 5.4, 13.4, 14.2, 14.5
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import { AdminCredentials } from '../../types/admin';

export interface AdminLoginProps {
  onLoginSuccess?: () => void;
  onCancel?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onCancel
}) => {
  const { login, isLoading, isLockedOut, lockoutExpiresAt } = useAdmin();
  const { theme } = useTheme();
  
  const [credentials, setCredentials] = useState<AdminCredentials>({
    username: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!credentials.username.trim() || !credentials.password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const result = await login(credentials);
      
      if (result.success) {
        Alert.alert('Success', 'Admin login successful', [
          {
            text: 'OK',
            onPress: () => {
              setCredentials({ username: '', password: '' });
              onLoginSuccess?.();
            }
          }
        ]);
      } else {
        let errorMessage = result.error || 'Login failed';
        
        if (result.remainingAttempts !== undefined) {
          errorMessage += `\n${result.remainingAttempts} attempts remaining`;
        }
        
        if (result.lockoutExpiresAt) {
          const remainingTime = Math.ceil((result.lockoutExpiresAt.getTime() - Date.now()) / 60000);
          errorMessage = `Account locked. Try again in ${remainingTime} minutes.`;
        }
        
        Alert.alert('Login Failed', errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An unexpected error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  }, [credentials, login, onLoginSuccess]);

  const handleCancel = useCallback(() => {
    setCredentials({ username: '', password: '' });
    onCancel?.();
  }, [onCancel]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const getLockoutMessage = useCallback(() => {
    if (!isLockedOut || !lockoutExpiresAt) return null;
    
    const remainingTime = Math.ceil((lockoutExpiresAt.getTime() - Date.now()) / 60000);
    return `Account locked. Try again in ${remainingTime} minutes.`;
  }, [isLockedOut, lockoutExpiresAt]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
      padding: 20,
      justifyContent: 'center'
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.textColor,
      textAlign: 'center',
      marginBottom: 30
    },
    inputContainer: {
      marginBottom: 20
    },
    label: {
      fontSize: 16,
      color: theme.textColor,
      marginBottom: 8,
      fontWeight: '500'
    },
    input: {
      borderWidth: 1,
      borderColor: theme.textColor,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.textColor,
      backgroundColor: 'transparent'
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    passwordInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.textColor,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.textColor,
      backgroundColor: 'transparent'
    },
    showPasswordButton: {
      position: 'absolute',
      right: 12,
      padding: 4
    },
    showPasswordText: {
      color: theme.textColor,
      fontSize: 12
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 30
    },
    button: {
      flex: 1,
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 5
    },
    loginButton: {
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
    loginButtonText: {
      color: theme.backgroundColor
    },
    cancelButtonText: {
      color: theme.textColor
    },
    disabledButton: {
      opacity: 0.5
    },
    lockoutMessage: {
      backgroundColor: '#ff4444',
      padding: 12,
      borderRadius: 8,
      marginBottom: 20
    },
    lockoutText: {
      color: '#ffffff',
      textAlign: 'center',
      fontWeight: '500'
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    loadingText: {
      color: theme.backgroundColor,
      marginLeft: 8
    }
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.textColor} />
        <Text style={[styles.label, { marginTop: 16 }]}>Loading admin interface...</Text>
      </View>
    );
  }

  const lockoutMessage = getLockoutMessage();

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.title}>Admin Login</Text>
      
      {lockoutMessage && (
        <View style={styles.lockoutMessage}>
          <Text style={styles.lockoutText}>{lockoutMessage}</Text>
        </View>
      )}
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={credentials.username}
          onChangeText={(text) => setCredentials(prev => ({ ...prev, username: text }))}
          placeholder="Enter admin username"
          placeholderTextColor={`${theme.textColor}80`}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSubmitting && !isLockedOut}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={credentials.password}
            onChangeText={(text) => setCredentials(prev => ({ ...prev, password: text }))}
            placeholder="Enter admin password"
            placeholderTextColor={`${theme.textColor}80`}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting && !isLockedOut}
          />
          <TouchableOpacity 
            style={styles.showPasswordButton}
            onPress={togglePasswordVisibility}
            disabled={isSubmitting || isLockedOut}
          >
            <Text style={styles.showPasswordText}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          disabled={isSubmitting}
        >
          <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.button, 
            styles.loginButton,
            (isSubmitting || isLockedOut) && styles.disabledButton
          ]}
          onPress={handleLogin}
          disabled={isSubmitting || isLockedOut}
        >
          {isSubmitting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.backgroundColor} />
              <Text style={styles.loadingText}>Logging in...</Text>
            </View>
          ) : (
            <Text style={[styles.buttonText, styles.loginButtonText]}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};