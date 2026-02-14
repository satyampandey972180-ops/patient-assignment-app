import * as ImageManipulator from 'expo-image-manipulator';

// Compress image to reduce file size
export async function compressImage(uri) {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    return result.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    // Return original URI if compression fails
    return uri;
  }
}
