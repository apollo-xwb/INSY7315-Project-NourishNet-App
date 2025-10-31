import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import logger from '../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CarouselWrapper from '../components/CarouselWrapper';
import Icon from '../utils/IconWrapper';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const { width: screenWidth } = Dimensions.get('window');

const OnboardingScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();

  const slides = [
    {
      title: t('slide1Title'),
      description: t('slide1Description'),
      icon: 'handshake',
    },
    {
      title: t('slide2Title'),
      description: t('slide2Description'),
      icon: 'volunteer-activism',
    },
    {
      title: t('slide3Title'),
      description: t('slide3Description'),
      icon: 'restaurant',
    },
  ];

  const renderItem = ({ item, index }) => {
    return (
      <View style={[styles.slide, { backgroundColor: theme.colors.surface }]}>
        <Icon name={item.icon} size={100} color={theme.colors.primary} style={styles.slideIcon} />
        <Text style={[styles.slideTitle, { color: theme.colors.text }]}>{item.title}</Text>
        <Text style={[styles.slideDescription, { color: theme.colors.textSecondary }]}>
          {item.description}
        </Text>
      </View>
    );
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('@nourishnet_has_launched', 'true');

      if (route.params?.onComplete) {
        route.params.onComplete();
      } else if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (error) {
      logger.error('Error saving first launch:', error);
    }
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.carouselContainer}>
        <CarouselWrapper
          data={slides}
          renderItem={renderItem}
          sliderWidth={screenWidth}
          itemWidth={screenWidth * 0.8}
          loop
        />
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.languageSelector}>
          <TouchableOpacity
            onPress={() => changeLanguage('en')}
            style={[
              styles.languageButton,
              i18n.language === 'en' && { backgroundColor: theme.colors.primaryDark },
            ]}
          >
            <Text style={[styles.languageButtonText, { color: theme.colors.surface }]}>EN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => changeLanguage('zu')}
            style={[
              styles.languageButton,
              i18n.language === 'zu' && { backgroundColor: theme.colors.primaryDark },
            ]}
          >
            <Text style={[styles.languageButtonText, { color: theme.colors.surface }]}>ZU</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => changeLanguage('af')}
            style={[
              styles.languageButton,
              i18n.language === 'af' && { backgroundColor: theme.colors.primaryDark },
            ]}
          >
            <Text style={[styles.languageButtonText, { color: theme.colors.surface }]}>AF</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.getStartedButton, { backgroundColor: theme.colors.accent }]}
          onPress={handleGetStarted}
          accessibilityLabel={t('getStarted')}
        >
          <Text style={[styles.getStartedButtonText, { color: theme.colors.surface }]}>
            {t('getStarted')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  slide: {
    width: screenWidth * 0.8,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  slideIcon: {
    marginBottom: 20,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  slideDescription: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  bottomContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  languageSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  languageButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  languageButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  getStartedButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
  },
  getStartedButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;
