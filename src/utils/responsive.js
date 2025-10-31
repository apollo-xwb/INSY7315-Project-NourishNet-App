import { Dimensions, Platform } from 'react-native';

const getWindowDimensions = () => Dimensions.get('window');

export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1440,
};

export const isSmallDevice = () => {
  const { width } = getWindowDimensions();
  return width < BREAKPOINTS.mobile;
};

export const isMobile = () => {
  const { width } = getWindowDimensions();
  return width < BREAKPOINTS.tablet;
};

export const isTablet = () => {
  const { width } = getWindowDimensions();
  return width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
};

export const isDesktop = () => {
  const { width } = getWindowDimensions();
  return width >= BREAKPOINTS.desktop;
};

export const isLargeDesktop = () => {
  const { width } = getWindowDimensions();
  return width >= BREAKPOINTS.largeDesktop;
};

export const getResponsiveValue = (mobile, tablet, desktop) => {
  if (isDesktop()) return desktop || tablet || mobile;
  if (isTablet()) return tablet || mobile;
  return mobile;
};

export const scale = (size) => {
  const { width } = getWindowDimensions();
  const baseWidth = 375;
  return (width / baseWidth) * size;
};

export const verticalScale = (size) => {
  const { height } = getWindowDimensions();
  const baseHeight = 812;
  return (height / baseHeight) * size;
};

export const moderateScale = (size, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

export const getColumns = () => {
  if (isLargeDesktop()) return 3;
  if (isDesktop()) return 2;
  if (isTablet()) return 2;
  return 1;
};

export const getMaxWidth = () => {
  if (Platform.OS === 'web') {
    if (isLargeDesktop()) return 1440;
    if (isDesktop()) return 1200;
    if (isTablet()) return 900;
  }
  return '100%';
};

export const getPadding = () => {
  return getResponsiveValue(16, 24, 32);
};

export const getCardWidth = () => {
  const columns = getColumns();
  const padding = getPadding();
  const gap = 16;

  if (Platform.OS === 'web' && !isMobile()) {
    const maxWidth = getMaxWidth();
    if (typeof maxWidth === 'number') {
      return (maxWidth - padding * 2 - gap * (columns - 1)) / columns;
    }
  }

  const { width } = getWindowDimensions();
  return (width - padding * 2 - gap * (columns - 1)) / columns;
};
