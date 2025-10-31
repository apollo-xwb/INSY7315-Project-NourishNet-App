import React from 'react';
import { Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../components/IconFallback';
import logger from '../utils/logger';

const Icon = ({ name, size = 24, color = '#000', style, ...props }) => {
  const safeStyle = style || {};

  try {
    return <MaterialIcons name={name} size={size} color={color} style={safeStyle} {...props} />;
  } catch (error) {
    logger.warn('Expo vector icon failed to render, using fallback:', error);
    return <IconFallback name={name} size={size} color={color} style={safeStyle} />;
  }
};

export default Icon;
