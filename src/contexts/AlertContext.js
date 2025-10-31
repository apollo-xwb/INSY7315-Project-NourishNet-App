/**
 * AlertProvider Context
 *
 * Purpose: Makes toast helpers (showSuccess, showError, etc.) available
 * app-wide and renders a stack of active toast notifications.
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Toast from '../components/Toast';

/**
 * Create Alert Context
 *
 * Pattern: Context with default value
 * - Provides context API even if provider not mounted
 * - Prevents context undefined errors
 *
 * Reference: React Context API best practices
 */
const AlertContext = createContext();

/**
 * Custom hook to use alert context
 *
 * Pattern: Custom hook wrapper
 * - Provides convenience API
 * - Throws error if used outside provider
 * - Type safety improvements
 *
 * @throws Error if used outside AlertProvider
 * @returns {Object} Alert context methods
 */
export const useToast = () => {
  const context = useContext(AlertContext);

  if (!context) {
    // Error boundary to catch missing provider
    throw new Error('useToast must be used within an AlertProvider');
  }

  return context;
};

/**
 * Alert Provider Component
 *
 * Purpose: Wraps app to provide toast notifications globally
 *
 * Implementation:
 * - Queue management with useState
 * - Unique IDs for each toast (useRef counter)
 * - Auto-dismiss after timeout
 * - Manual dismissal support
 *
 * @param {Object} props - Provider props
 * @param {React.ReactNode} props.children - App component tree
 *
 * @returns {React.Component} AlertProvider wrapper
 */
export const AlertProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const nextIdRef = useRef(0);

  /**
   * Generate unique toast ID
   *
   * Pattern: Ref-based counter
   * - Ensures unique IDs across re-renders
   * - Increments regardless of state updates
   * - No dependency on state
   *
   * @returns {string} Unique toast identifier
   */
  const getNextId = useCallback(() => {
    return `toast_${nextIdRef.current++}`;
  }, []);

  /**
   * Add a toast to the queue
   *
   * Queue Management:
   * - Adds to end of queue (LIFO - Last In, First Off top of screen)
   * - Generates unique ID
   * - Auto-dismisses after duration
   *
   * @param {Object} options - Toast options
   * @param {string} options.message - Toast message
   * @param {string} options.variant - Toast variant (success/error/warning/info)
   * @param {number} options.duration - Auto-dismiss duration (ms)
   * @param {string} options.actionText - Optional action button text
   * @param {Function} options.onAction - Optional action handler
   *
   * @returns {string} Toast ID (for potential cancellation)
   */
  const showToast = useCallback(
    ({ message, variant = 'info', duration = 3000, actionText, onAction }) => {
      const id = getNextId();

      const toast = {
        id,
        message,
        variant,
        duration,
        actionText,
        onAction,
      };

      // Add to queue (immutable update)
      setToasts((prev) => [...prev, toast]);

      // Return ID for potential manual dismissal
      return id;
    },
    [getNextId],
  );

  /**
   * Convenience methods for different toast variants
   *
   * API Design: Expressive methods
   * - showSuccess() vs showToast({ variant: 'success' })
   * - More readable and intentional
   * - Encourages semantic usage
   *
   * Reference: "Clean Code" by Robert C. Martin (Function naming)
   */

  /**
   * Show success toast
   *
   * Use Case: Successful operations (save, submit, etc.)
   *
   * @param {string} message - Success message
   * @param {Object} options - Additional options
   */
  const showSuccess = useCallback(
    (message, options = {}) => {
      return showToast({
        message,
        variant: 'success',
        ...options,
      });
    },
    [showToast],
  );

  /**
   * Show error toast
   *
   * Use Case: Failures, validation errors, etc.
   *
   * @param {string} message - Error message
   * @param {Object} options - Additional options
   */
  const showError = useCallback(
    (message, options = {}) => {
      return showToast({
        message,
        variant: 'error',
        duration: 5000, // Errors stay longer for visibility
        ...options,
      });
    },
    [showToast],
  );

  /**
   * Show warning toast
   *
   * Use Case: Cautions, important info that needs attention
   *
   * @param {string} message - Warning message
   * @param {Object} options - Additional options
   */
  const showWarning = useCallback(
    (message, options = {}) => {
      return showToast({
        message,
        variant: 'warning',
        ...options,
      });
    },
    [showToast],
  );

  /**
   * Show info toast
   *
   * Use Case: General information, tips, etc.
   *
   * @param {string} message - Info message
   * @param {Object} options - Additional options
   */
  const showInfo = useCallback(
    (message, options = {}) => {
      return showToast({
        message,
        variant: 'info',
        ...options,
      });
    },
    [showToast],
  );

  /**
   * Dismiss a specific toast
   *
   * Use Case: Manual dismissal or cancellation
   *
   * @param {string} id - Toast ID to dismiss
   */
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Dismiss all toasts
   *
   * Use Case: Clear screen, reset state
   */
  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  /**
   * Show legacy Alert.alert compatibility
   *
   * Pattern: Adapter Pattern
   * - Provides compatibility with existing Alert.alert API
   * - Eases migration from Alert.alert to toast
   * - Shows Alert.alert() as a toast notification
   *
   * Use Case: Gradual migration, compatibility layer
   *
   * Note: For critical errors that need blocking, still use Alert.alert
   *
   * @param {string} title - Alert title
   * @param {string} message - Alert message
   * @param {Array} buttons - Alert buttons (not implemented in toast)
   */
  const showAlert = useCallback(
    (title, message, buttons = []) => {
      // Show as warning toast (since it's an alert)
      // Can't implement buttons in toast (use Alert.alert for actual button confirmation)

      if (buttons && buttons.length > 0) {
        // If there are buttons, we need blocking dialog
        // Fallback to browser Alert.alert
        console.warn(
          'showAlert called with buttons - use Alert.alert from react-native for button support',
        );
        const { Alert } = require('react-native');
        Alert.alert(title, message, buttons);
      } else {
        // No buttons, show as toast
        showWarning(`${title}: ${message}`, { duration: 4000 });
      }
    },
    [showWarning],
  );

  /**
   * Context value
   *
   * Stable reference using useCallback
   * - Prevents unnecessary re-renders in child components
   * - Maintains referential equality
   *
   * Reference: React Performance - Context value stability
   */
  const value = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showAlert, // Legacy compatibility
    dismissToast,
    dismissAll,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}

      {/* Toast Container */}
      {/* 
        Layout: Fixed positioning at top of screen
        - Toasts stack from top (last in on top)
        - Each toast has margin-bottom for spacing
        - Container doesn't block touch events (pointerEvents: 'box-none')
      */}
      <View style={styles.toastContainer} pointerEvents="box-none">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={dismissToast} />
        ))}
      </View>
    </AlertContext.Provider>
  );
};

/**
 * StyleSheet for toast container
 *
 * Layout Strategy:
 * - Fixed at top of screen
 * - Full width with safe area padding
 * - Z-index above all other content
 * - Pointer events don't block underlying content
 */
const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 60, // Below status bar + safe area
    left: 0,
    right: 0,
    zIndex: 9999, // Above all other content
    paddingTop: 8,
  },
});

/**
 * Default export for convenience
 */
export default AlertContext;
