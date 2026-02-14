import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';

class StorageService {
  /**
   * Upload/store an image locally using AsyncStorage
   * @param {string} uri - Local image URI
   * @param {string} patientId - Patient ID for organizing images
   * @returns {Promise<string>} Stored image key
   */
  async uploadImage(uri, patientId) {
    try {
      // Compress the image before storing
      const compressedImage = await this.compressImage(uri);

      // Generate unique key for the image
      const imageKey = `image_${patientId}_${Date.now()}`;

      // Store the compressed image URI in AsyncStorage
      await AsyncStorage.setItem(imageKey, compressedImage.uri);

      return imageKey;
    } catch (error) {
      console.error('Upload image error:', error);
      throw new Error('Failed to store image');
    }
  }

  /**
   * Delete an image from AsyncStorage
   * @param {string} imageKey - Image key to delete
   * @returns {Promise<void>}
   */
  async deleteImage(imageKey) {
    try {
      await AsyncStorage.removeItem(imageKey);
    } catch (error) {
      console.error('Delete image error:', error);
      throw new Error('Failed to delete image');
    }
  }

  /**
   * Get an image URI from AsyncStorage
   * @param {string} imageKey - Image key
   * @returns {Promise<string|null>} Image URI or null
   */
  async getImage(imageKey) {
    try {
      const imageUri = await AsyncStorage.getItem(imageKey);
      return imageUri;
    } catch (error) {
      console.error('Get image error:', error);
      return null;
    }
  }

  /**
   * Compress an image to reduce file size
   * @param {string} uri - Original image URI
   * @param {number} quality - Compression quality (0-1)
   * @returns {Promise<Object>} Compressed image object
   */
  async compressImage(uri, quality = 0.7) {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }], // Resize to max width of 1024px
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return manipulatedImage;
    } catch (error) {
      console.error('Compress image error:', error);
      // Return original URI if compression fails
      return { uri };
    }
  }

  /**
   * Upload image with retry logic
   * @param {string} uri - Image URI
   * @param {string} patientId - Patient ID
   * @param {number} maxRetries - Maximum number of retries
   * @returns {Promise<string>} Stored image key
   */
  async uploadImageWithRetry(uri, patientId, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const imageKey = await this.uploadImage(uri, patientId);
        return imageKey;
      } catch (error) {
        console.error(`Upload attempt ${attempt} failed:`, error);
        lastError = error;

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        }
      }
    }

    throw lastError || new Error('Failed to upload image after retries');
  }

  /**
   * Clear all stored images (use with caution)
   * @returns {Promise<void>}
   */
  async clearAllImages() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const imageKeys = keys.filter((key) => key.startsWith('image_'));
      await AsyncStorage.multiRemove(imageKeys);
    } catch (error) {
      console.error('Clear all images error:', error);
      throw new Error('Failed to clear images');
    }
  }

  /**
   * Get all image keys
   * @returns {Promise<Array<string>>} Array of image keys
   */
  async getAllImageKeys() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.filter((key) => key.startsWith('image_'));
    } catch (error) {
      console.error('Get all image keys error:', error);
      return [];
    }
  }
}

// Export singleton instance
export default new StorageService();
