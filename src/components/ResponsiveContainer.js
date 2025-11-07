import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { getMaxWidth, getPadding } from '../utils/responsive';

const ResponsiveContainer = ({ children, style, scrollable = false, noPadding = false }) => {
  const maxWidth = getMaxWidth();
  const padding = noPadding ? 0 : getPadding();

  const containerStyle = [
    styles.container,
    {
      maxWidth,
      paddingHorizontal: padding,
      width: '100%',
      alignSelf: 'center',
    },
    style,
  ];

  if (scrollable) {
    return (
      <ScrollView
        contentContainerStyle={containerStyle}
        showsVerticalScrollIndicator={Platform.OS === 'web'}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ResponsiveContainer;






