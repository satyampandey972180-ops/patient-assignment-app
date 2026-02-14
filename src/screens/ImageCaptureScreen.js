import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { addRecord } from '../store/recordsSlice';
import { selectTheme } from '../store/themeSlice';
import { getTheme } from '../theme/tokens';
import { compressImage } from '../utils/imageCompression';
import { generateAIResult } from '../utils/aiSimulation';

export default function ImageCaptureScreen({ route, navigation }) {
  const { patientId } = route.params;
  const [selectedImage, setSelectedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  const dispatch = useDispatch();
  const themeMode = useSelector(selectTheme);
  const theme = getTheme(themeMode);

  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    return cameraPermission.status === 'granted' && galleryPermission.status === 'granted';
  };

  const handleCamera = async () => {
    const hasPermission = await requestPermissions();
    
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleGallery = async () => {
    const hasPermission = await requestPermissions();
    
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Gallery permission is required to select photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleConfirm = async () => {
    if (!selectedImage) {
      return;
    }

    setProcessing(true);

    try {
      // Compress image
      const compressedUri = await compressImage(selectedImage);
      
      // Generate AI result
      const aiResult = generateAIResult();
      
      // Create record
      const record = {
        patientId,
        imageUri: compressedUri,
        aiResult: aiResult.result,
        aiExplanation: aiResult.explanation,
      };
      
      dispatch(addRecord(record));
      
      Alert.alert('Success', 'Image captured and analyzed successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to process image');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    setSelectedImage(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {selectedImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: selectedImage }} style={styles.preview} />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={handleConfirm}
              disabled={processing}
            >
              <Text style={styles.buttonText}>
                {processing ? 'Processing...' : 'Confirm'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: theme.danger }]}
              onPress={handleCancel}
              disabled={processing}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.optionsContainer}>
          <Text style={[styles.title, { color: theme.text }]}>Capture Medical Image</Text>
          
          <TouchableOpacity 
            style={[styles.optionButton, { backgroundColor: theme.surface }]}
            onPress={handleCamera}
          >
            <Text style={[styles.optionText, { color: theme.text }]}>📷 Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.optionButton, { backgroundColor: theme.surface }]}
            onPress={handleGallery}
          >
            <Text style={[styles.optionText, { color: theme.text }]}>🖼️ Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  optionButton: {
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  optionText: {
    fontSize: 20,
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    padding: 20,
  },
  preview: {
    flex: 1,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
