import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  BackHandler,
} from 'react-native';
import { ExitAdConfig } from '../models/Advertisement';

interface ExitAdvertisementProps {
  adConfig?: ExitAdConfig;
  isVisible: boolean;
  onAdComplete: () => void;
  onAdSkip: () => void;
  onCancel: () => void;
}

const ExitAdvertisement: React.FC<ExitAdvertisementProps> = ({
  adConfig,
  isVisible,
  onAdComplete,
  onAdSkip,
  onCancel,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(5);
  const [canSkip, setCanSkip] = useState<boolean>(false);

  useEffect(() => {
    if (!isVisible || !adConfig) {
      return;
    }

    // Reset timer when modal becomes visible
    setTimeRemaining(5);
    setCanSkip(false);

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setCanSkip(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, adConfig]);

  useEffect(() => {
    if (!isVisible) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Prevent back button from closing the ad modal
      return true;
    });

    return () => backHandler.remove();
  }, [isVisible]);

  const handleSkipAd = () => {
    if (canSkip) {
      onAdSkip();
    }
  };

  const handleAdComplete = () => {
    onAdComplete();
  };

  if (!adConfig || !isVisible) {
    return null;
  }

  const borderStyles = {
    borderTopWidth: adConfig.borderConfig.top.width,
    borderTopColor: adConfig.borderConfig.top.color,
    borderRightWidth: adConfig.borderConfig.right.width,
    borderRightColor: adConfig.borderConfig.right.color,
    borderBottomWidth: adConfig.borderConfig.bottom.width,
    borderBottomColor: adConfig.borderConfig.bottom.color,
    borderLeftWidth: adConfig.borderConfig.left.width,
    borderLeftColor: adConfig.borderConfig.left.color,
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        // Prevent modal from being closed by back button
      }}
    >
      <View style={styles.overlay}>
        <View style={[styles.adContainer, borderStyles]}>
          {/* Ad Content */}
          <View style={styles.adContent}>
            <Text style={styles.adText}>{adConfig.content}</Text>
          </View>

          {/* Timer and Controls */}
          <View style={styles.controlsContainer}>
            {!canSkip ? (
              <Text style={styles.timerText}>
                Skip available in {timeRemaining} seconds
              </Text>
            ) : (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkipAd}
                  accessibilityLabel="Skip advertisement"
                >
                  <Text style={styles.skipButtonText}>Skip Ad</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleAdComplete}
                  accessibilityLabel="Continue watching advertisement"
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Cancel button (small X in corner) */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            accessibilityLabel="Cancel app closure"
          >
            <Text style={styles.cancelButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adContainer: {
    width: width * 0.9,
    maxHeight: height * 0.7,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    position: 'relative',
  },
  adContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  adText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333333',
    lineHeight: 24,
  },
  controlsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  skipButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    minWidth: 100,
  },
  skipButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#4ecdc4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    minWidth: 100,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 20,
    color: '#666666',
    fontWeight: 'bold',
  },
});

export default ExitAdvertisement;