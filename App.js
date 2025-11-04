import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { AlertProvider } from './src/contexts/AlertContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeOfflineSync } from './src/services/offlineQueue';
import './src/i18n';

export default function App() {
  useEffect(() => {
    initializeOfflineSync();
    
    // Fix mobile web double-tap issue - be selective to not break React Native Web
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        /* Prevent double-tap zoom on interactive elements only */
        [data-testid], [role="button"], button, a {
          touch-action: manipulation;
          -webkit-tap-highlight-color: rgba(0,0,0,0);
        }
        /* Prevent text selection on buttons */
        button, [role="button"] {
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }
        /* Ensure React Native Web containers allow touch */
        div[style*="flex"] {
          touch-action: auto;
        }
      `;
      document.head.appendChild(style);
      
      // Also add viewport meta if not present
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.name = 'viewport';
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(viewportMeta);
      } else {
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      }
      
      return () => {
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      };
    }
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <AlertProvider>
                <AppNavigator />
                <StatusBar style="light" backgroundColor="#84bd00" />
              </AlertProvider>
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
