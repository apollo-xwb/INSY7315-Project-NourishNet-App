import React, { createContext, useContext, useState } from 'react';
import logger from '../utils/logger';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    logger.error('useTheme must be used within a ThemeProvider');

    return {
      theme: {
        colors: {
          primary: '#84bd00',
          surface: '#FFFFFF',
          text: '#212121',
          textSecondary: '#757575',
          background: '#F5F5F5',
          border: '#E0E0E0',
          error: '#F44336',
          success: '#84bd00',
          warning: '#FF9800',
        },
        spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
        borderRadius: { sm: 4, md: 8, lg: 12, xl: 16 },
        typography: {
          h1: { fontSize: 32, fontWeight: 'bold' },
          h2: { fontSize: 24, fontWeight: 'bold' },
          body: { fontSize: 16, fontWeight: 'normal' },
        },
        shadows: {
          small: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          },
        },
      },
      isDarkMode: false,
      toggleTheme: () => {},
    };
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = {
    colors: {
      primary: '#84bd00',
      primaryLight: '#9dd116',
      primaryDark: '#6a9600',
      secondary: '#8D6E63',
      secondaryLight: '#A1887F',
      secondaryDark: '#5D4037',
      accent: '#FF9800',
      background: '#F5F5F5',
      surface: '#FFFFFF',
      text: '#212121',
      textSecondary: '#757575',
      textLight: '#BDBDBD',
      error: '#F44336',
      success: '#84bd00',
      warning: '#FF9800',
      info: '#2196F3',
      border: '#E0E0E0',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      round: 50,
    },
    typography: {
      h1: {
        fontSize: 32,
        fontWeight: 'bold',
        lineHeight: 40,
      },
      h2: {
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 32,
      },
      h3: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
      },
      body: {
        fontSize: 16,
        fontWeight: 'normal',
        lineHeight: 24,
      },
      caption: {
        fontSize: 14,
        fontWeight: 'normal',
        lineHeight: 20,
      },
      small: {
        fontSize: 12,
        fontWeight: 'normal',
        lineHeight: 16,
      },
    },
    shadows: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
      },
    },
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
