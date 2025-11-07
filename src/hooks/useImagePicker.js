import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { optimizeImageForUpload } from '../utils/imageUtils';
import logger from '../utils/logger';

const useImagePicker = ({
  multiple = false,
  maxImages = 10,
  quality = 0.8,
  maxWidth = 1920,
  maxHeight = 1080,
  onError = null,
} = {}) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestPermission = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        const errorMsg = 'Permission to access camera roll is required to select images.';
        logger.warn('[useImagePicker] Permission denied:', errorMsg);
        setError(new Error(errorMsg));
        if (onError) onError(new Error(errorMsg));
        return false;
      }

      return true;
    } catch (err) {
      logger.error('[useImagePicker] Error requesting permission:', err);
      setError(err);
      if (onError) onError(err);
      return false;
    }
  }, [onError]);

  const validateSelection = useCallback(
    (currentCount, newCount) => {
      if (multiple && currentCount + newCount > maxImages) {
        const errorMsg = `You can only select up to ${maxImages} images.`;
        logger.warn('[useImagePicker] Validation failed:', errorMsg);
        setError(new Error(errorMsg));
        if (onError) onError(new Error(errorMsg));
        return false;
      }

      return true;
    },
    [multiple, maxImages, onError],
  );

  const optimizeImage = useCallback(
    async (imageAsset) => {
      try {
        logger.info('[useImagePicker] Optimizing image:', imageAsset.uri);

        const optimizedUri = await optimizeImageForUpload(imageAsset.uri, {
          quality,
          maxWidth,
          maxHeight,
        });

        return {
          uri: optimizedUri,
          width: imageAsset.width,
          height: imageAsset.height,
          type: 'image/jpeg',
          original: imageAsset.uri,
        };
      } catch (err) {
        logger.error('[useImagePicker] Error optimizing image:', err);
        return {
          uri: imageAsset.uri,
          width: imageAsset.width,
          height: imageAsset.height,
          type: imageAsset.type || 'image',
          original: imageAsset.uri,
        };
      }
    },
    [quality, maxWidth, maxHeight],
  );

  const pickImage = useCallback(async () => {
    logger.info('[useImagePicker] pickImage called');
    setLoading(true);
    setError(null);

    try {
      const permissionGranted = await requestPermission();
      if (!permissionGranted) {
        setLoading(false);
        return;
      }

      const pickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: multiple,
        quality,
        allowsEditing: false,
      };

      const result = await ImagePicker.launchImageLibraryAsync({
        ...pickerOptions,
        quality: 1,
        exif: false,
      });

      if (result.canceled) {
        logger.info('[useImagePicker] User cancelled image selection');
        setLoading(false);
        return;
      }

      const selectedAssets = result.assets || [];
      if (!validateSelection(images.length, selectedAssets.length)) {
        setLoading(false);
        return;
      }

      logger.info(`[useImagePicker] Optimizing ${selectedAssets.length} image(s)`);
      const optimizationPromises = selectedAssets.map((asset) => optimizeImage(asset));
      const optimizedImages = await Promise.all(optimizationPromises);

      if (multiple) {
        setImages((prev) => [...prev, ...optimizedImages]);
      } else {
        setImages(optimizedImages);
      }

      logger.info(`[useImagePicker] Successfully selected ${optimizedImages.length} image(s)`);
    } catch (err) {
      logger.error('[useImagePicker] Error picking image:', err);
      setError(err);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  }, [
    multiple,
    maxImages,
    images.length,
    requestPermission,
    validateSelection,
    optimizeImage,
    onError,
  ]);

  const removeImage = useCallback((index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    logger.info(`[useImagePicker] Removed image at index ${index}`);
  }, []);

  const clearImages = useCallback(() => {
    setImages([]);
    setError(null);
    logger.info('[useImagePicker] Cleared all images');
  }, []);

  return {
    images,
    pickImage,
    removeImage,
    clearImages,
    loading,
    error,
  };
};

export default useImagePicker;
