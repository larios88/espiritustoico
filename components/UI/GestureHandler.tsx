/**
 * Gesture Handler Component
 * Enhanced gesture controls for Pocket Casts-like experience
 */

import React, { useRef, useCallback } from 'react';
import {
  View,
  PanResponder,
  StyleSheet,
} from 'react-native';
import { GESTURE } from '../../constants/design';

export interface GestureHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
}

export const GestureHandler: React.FC<GestureHandlerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onDoubleTap,
  onLongPress,
  onPress,
  disabled = false,
  style,
}) => {
  const lastTap = useRef<number>(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      if (disabled) return false;
      const { dx, dy } = gestureState;
      return Math.abs(dx) > 10 || Math.abs(dy) > 10;
    },

    onPanResponderGrant: (evt) => {
      if (disabled) return;
      
      // Handle long press
      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          onLongPress();
        }, GESTURE.longPressDelay);
      }

      // Handle double tap
      const now = Date.now();
      if (now - lastTap.current < GESTURE.doubleTapDelay && onDoubleTap) {
        onDoubleTap();
        lastTap.current = 0;
      } else {
        lastTap.current = now;
      }
    },

    onPanResponderMove: () => {
      // Clear long press timer if user moves
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    },

    onPanResponderRelease: (evt, gestureState) => {
      if (disabled) return;

      // Clear long press timer
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      const { dx, dy } = gestureState;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      // Check for swipe gestures
      if (absX > GESTURE.swipeThreshold || absY > GESTURE.swipeThreshold) {
        if (absX > absY) {
          // Horizontal swipe
          if (dx > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (dx < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (dy > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (dy < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      } else if (absX < 10 && absY < 10) {
        // Handle single tap (with delay to check for double tap)
        setTimeout(() => {
          if (Date.now() - lastTap.current >= GESTURE.doubleTapDelay && onPress) {
            onPress();
          }
        }, GESTURE.doubleTapDelay);
      }
    },
  });

  if (disabled) {
    return <View style={style}>{children}</View>;
  }

  return (
    <View style={[styles.container, style]} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});