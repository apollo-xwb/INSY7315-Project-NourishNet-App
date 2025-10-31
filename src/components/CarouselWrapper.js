import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from '../utils/IconWrapper';

const { width: screenWidth } = Dimensions.get('window');

const CarouselWrapper = ({ data, renderItem, sliderWidth, itemWidth, loop }) => {
  const { theme } = useTheme();

  if (Platform.OS === 'web') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.webCarouselContainer}
        style={styles.webCarousel}
      >
        {data.map((item, index) => (
          <View key={index} style={[styles.webSlide, { width: itemWidth }]}>
            {renderItem({ item, index })}
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.webCarouselContainer}
      style={styles.webCarousel}
    >
      {data.map((item, index) => (
        <View key={index} style={[styles.webSlide, { width: itemWidth }]}>
          {renderItem({ item, index })}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  webCarousel: {
    flex: 1,
  },
  webCarouselContainer: {
    paddingHorizontal: 20,
  },
  webSlide: {
    marginRight: 20,
  },
});

export default CarouselWrapper;
