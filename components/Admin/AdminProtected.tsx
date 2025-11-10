/**
 * Admin Protected Component - HOC for protecting admin-only features
 * Requirements: 5.4, 13.4, 14.2, 14.5
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import { AdminResource, AdminAction } from '../../types/admin';
import { AdminToggle } from './AdminToggle';

export interface AdminProtectedProps {
  children: React.ReactNode;
  resource?: AdminResource;
  action?: AdminAction;
  fallback?: React.ReactNode;
  showLoginPrompt?: boolean;
  requireAuth?: boolean;
}

export const AdminProtected: React.FC<AdminProtectedProps> = ({
  children,
  resource,
  action,
  fallback,
  showLoginPrompt = true,
  requireAuth = true
}) => {
  const { isAdminMode, hasPermission, isAuthenticated } = useAdmin();
  const { theme } = useTheme();

  // Check if user is authenticated as admin
  const isAuth = isAuthenticated();
  
  // Check specific permission if resource and action are provided
  const hasRequiredPermission = resource && action 
    ? hasPermission(resource, action)
    : true;

  // Determine if access should be granted
  const hasAccess = requireAuth 
    ? (isAuth && hasRequiredPermission)
    : hasRequiredPermission;

  const styles = StyleSheet.create({
    container: {
      flex: 1
    },
    accessDeniedContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.backgroundColor
    },
    accessDeniedTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.textColor,
      textAlign: 'center',
      marginBottom: 12
    },
    accessDeniedMessage: {
      fontSize: 14,
      color: theme.textColor,
      textAlign: 'center',
      opacity: 0.8,
      marginBottom: 24,
      lineHeight: 20
    },
    loginPromptContainer: {
      alignItems: 'center'
    }
  });

  // If access is granted, render children
  if (hasAccess) {
    return <View style={styles.container}>{children}</View>;
  }

  // If custom fallback is provided, use it
  if (fallback) {
    return <View style={styles.container}>{fallback}</View>;
  }

  // Default access denied UI
  return (
    <View style={styles.accessDeniedContainer}>
      <Text style={styles.accessDeniedTitle}>
        Admin Access Required
      </Text>
      
      <Text style={styles.accessDeniedMessage}>
        {!isAuth 
          ? 'You need to login as an administrator to access this feature.'
          : 'You don\'t have permission to access this feature.'
        }
        {resource && action && (
          `\n\nRequired permission: ${action} on ${resource}`
        )}
      </Text>
      
      {showLoginPrompt && !isAuth && (
        <View style={styles.loginPromptContainer}>
          <AdminToggle showLabel={false} />
        </View>
      )}
    </View>
  );
};

/**
 * Higher-order component for wrapping components with admin protection
 */
export function withAdminProtection<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<AdminProtectedProps, 'children'> = {}
) {
  return function AdminProtectedComponent(props: P) {
    return (
      <AdminProtected {...options}>
        <Component {...props} />
      </AdminProtected>
    );
  };
}