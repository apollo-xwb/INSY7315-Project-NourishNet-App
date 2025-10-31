import * as ImageManipulator from 'expo-image-manipulator';
import logger from './logger';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

export const compressImage = async (uri, quality = 0.7) => {
  try {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG },
    );

    logger.info('Image compressed successfully');
    return manipulatedImage.uri;
  } catch (error) {
    logger.error('Error compressing image:', error);
    return uri;
  }
};

export const createThumbnail = async (uri, size = 300) => {
  try {
    const thumbnail = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: size } }], {
      compress: 0.5,
      format: ImageManipulator.SaveFormat.JPEG,
    });

    logger.info('Thumbnail created successfully');
    return thumbnail.uri;
  } catch (error) {
    logger.error('Error creating thumbnail:', error);
    return uri;
  }
};

// Returns optimized image URI (string). Callers may generate thumbnails separately if needed.
export const optimizeImageForUpload = async (uri, { quality = 0.8, maxWidth = 1200, maxHeight } = {}) => {
  try {
    const actions = maxHeight ? [{ resize: { width: maxWidth, height: maxHeight } }] : [{ resize: { width: maxWidth } }];
    const optimized = await ImageManipulator.manipulateAsync(uri, actions, {
      compress: quality,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return optimized.uri;
  } catch (error) {
    logger.error('Error optimizing image:', error);
    return uri;
  }
};

/**
 * Uploads any URI (web: blob/data URL, native: file) to Firebase Storage and returns the download URL.
 * @param {string} uri
 * @param {string} [folder='donations']
 * @returns {Promise<string>} download URL
 */
export const uploadImageToStorage = async (uri, folder = 'donations') => {
  try {
    const storage = getStorage();
    let blob;
    const isWeb = Platform.OS === 'web';
    if (isWeb) {
      // Web: fetch blob from blob/data URL
      if (uri.startsWith('data:') || uri.startsWith('blob:')) {
        const res = await fetch(uri);
        blob = await res.blob();
      } else {
        throw new Error('Invalid web image URI');
      }
    } else {
      // Native: use fetch to get blob from file URI
      if (uri.startsWith('file://')) {
        const res = await fetch(uri);
        blob = await res.blob();
      } else {
        throw new Error('Invalid native file URI');
      }
    }
    const filename = `${uuidv4()}.jpg`;
    const storageRef = ref(storage, `${folder}/${filename}`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  } catch (err) {
    logger.error('Error uploading image to storage:', err);
    throw err;
  }
};



