import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Toast from '../components/Toast';
import logger from '../utils/logger';

const AlertContext = createContext();

export const useToast = () => {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error('useToast must be used within an AlertProvider');
  }

  return context;
};

export const AlertProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const nextIdRef = useRef(0);

  // Simple incremental ID so we can filter/dismiss toasts easily
  const getNextId = useCallback(() => {
    return `toast_${nextIdRef.current++}`;
  }, []);

  // Core helper for adding toast messages of any type
  const addToast = useCallback((type, message, options = {}) => {
    if (!message) {
      logger.warn('[AlertContext] Ignored toast with empty message');
      return null;
    }

    const id = getNextId();
    const toast = {
      id,
      type,
      message,
      title: options.title || null,
      duration: options.duration || 4000,
      action: options.action || null,
      createdAt: Date.now(),
    };

    setToasts((prev) => [...prev, toast]);

    logger.info('[AlertContext] Added toast:', toast);

    return id;
  }, [getNextId]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience helpers for common toast styles
  const showSuccess = useCallback((message, options) => addToast('success', message, options), [
    addToast,
  ]);
  const showError = useCallback((message, options) => addToast('error', message, options), [
    addToast,
  ]);
  const showWarning = useCallback((message, options) => addToast('warning', message, options), [
    addToast,
  ]);
  const showInfo = useCallback((message, options) => addToast('info', message, options), [
    addToast,
  ]);

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearToasts,
    removeToast,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      <View pointerEvents="none" style={styles.toastContainer}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            title={toast.title}
            duration={toast.duration}
            action={toast.action}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </View>
    </AlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 16,
    gap: 12,
    zIndex: 9999,
  },
});

export default AlertContext;
