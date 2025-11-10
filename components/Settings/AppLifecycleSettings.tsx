import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';

import {useThemeStyles} from '../../hooks/useThemeStyles';
import {useAppLifecycle} from '../../hooks/useAppLifecycle';
import {AppLifecycleSettings as LifecycleSettings} from '../../services/AppLifecycleService';

export const AppLifecycleSettings: React.FC = () => {
  const themeStyles = useThemeStyles();
  const {settings, updateSettings} = useAppLifecycle();
  const [localSettings, setLocalSettings] = useState<LifecycleSettings | null>(null);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSettingChange = async (key: keyof LifecycleSettings, value: boolean) => {
    if (!localSettings) return;

    try {
      const newSettings = {...localSettings, [key]: value};
      setLocalSettings(newSettings);
      await updateSettings({[key]: value});

      // Show confirmation for important settings
      if (key === 'enableBackgroundPlayback' && value) {
        Alert.alert(
          'Background Playback Enabled',
          'Audio will continue playing when you switch to other apps or lock your device.',
          [{text: 'OK'}]
        );
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
      // Revert local state
      if (settings) {
        setLocalSettings(settings);
      }
    }
  };

  if (!localSettings) {
    return null;
  }

  const settingsOptions = [
    {
      key: 'enableBackgroundPlayback' as keyof LifecycleSettings,
      title: 'Background Playback',
      subtitle: 'Continue playing audio when app is in background',
      value: localSettings.enableBackgroundPlayback,
    },
    {
      key: 'savePlaybackPosition' as keyof LifecycleSettings,
      title: 'Save Playback Position',
      subtitle: 'Remember where you left off when reopening the app',
      value: localSettings.savePlaybackPosition,
    },
    {
      key: 'showExitAd' as keyof LifecycleSettings,
      title: 'Exit Advertisement',
      subtitle: 'Show advertisement when closing the app',
      value: localSettings.showExitAd,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, {color: themeStyles.textColor}]}>
        App Behavior
      </Text>
      
      {settingsOptions.map((option) => (
        <View 
          key={option.key}
          style={[
            styles.settingItem,
            {borderBottomColor: `${themeStyles.textColor}20`}
          ]}
        >
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, {color: themeStyles.textColor}]}>
              {option.title}
            </Text>
            <Text style={[styles.settingSubtitle, {color: themeStyles.textColor}]}>
              {option.subtitle}
            </Text>
          </View>
          
          <Switch
            value={option.value}
            onValueChange={(value) => handleSettingChange(option.key, value)}
            trackColor={{
              false: `${themeStyles.textColor}30`,
              true: `${themeStyles.textColor}60`,
            }}
            thumbColor={option.value ? themeStyles.textColor : `${themeStyles.textColor}80`}
          />
        </View>
      ))}

      <View style={styles.infoContainer}>
        <Text style={[styles.infoText, {color: themeStyles.textColor}]}>
          • Background playback allows continuous listening while using other apps
        </Text>
        <Text style={[styles.infoText, {color: themeStyles.textColor}]}>
          • Playback position is automatically saved when you close the app
        </Text>
        <Text style={[styles.infoText, {color: themeStyles.textColor}]}>
          • Exit advertisements help support the podcast
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
  },
  infoContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(159, 128, 105, 0.1)',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 16,
    marginBottom: 4,
  },
});