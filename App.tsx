/**
 * Podcast Player App - Main Application Component
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import EpisodesScreen from './src/screens/EpisodesScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import SearchScreen from './src/screens/SearchScreen';
import BookmarksScreen from './src/screens/BookmarksScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Context Providers
import { ThemeProvider } from './src/context/ThemeContext';
import { AdminProvider } from './src/context/AdminContext';

// Services initialization
import { audioService } from './src/services/AudioService';
import { rssService } from './src/services/RSSService';

const Tab = createBottomTabNavigator();

// Initialize services (with error handling for web)
const initializeServices = async () => {
  try {
    await audioService.initialize();
    await rssService.initialize();
    console.log('Services initialized successfully');
  } catch (error) {
    console.log('Services initialization failed (expected in web):', error);
  }
};

initializeServices();

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AdminProvider>
            <NavigationContainer>
              <Tab.Navigator
                screenOptions={{
                  headerShown: false,
                  tabBarStyle: {
                    backgroundColor: '#000000',
                    borderTopColor: '#9f8069',
                  },
                  tabBarActiveTintColor: '#9f8069',
                  tabBarInactiveTintColor: '#666666',
                }}
              >
                <Tab.Screen 
                  name="Episodes" 
                  component={EpisodesScreen}
                  options={{
                    tabBarLabel: 'Episodes',
                  }}
                />
                <Tab.Screen 
                  name="Player" 
                  component={PlayerScreen}
                  options={{
                    tabBarLabel: 'Player',
                  }}
                />
                <Tab.Screen 
                  name="Search" 
                  component={SearchScreen}
                  options={{
                    tabBarLabel: 'Search',
                  }}
                />
                <Tab.Screen 
                  name="Bookmarks" 
                  component={BookmarksScreen}
                  options={{
                    tabBarLabel: 'Bookmarks',
                  }}
                />
                <Tab.Screen 
                  name="Settings" 
                  component={SettingsScreen}
                  options={{
                    tabBarLabel: 'Settings',
                  }}
                />
              </Tab.Navigator>
            </NavigationContainer>
          </AdminProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;