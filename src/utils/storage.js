import AsyncStorage from '@react-native-async-storage/async-storage';

// Save data to AsyncStorage
export async function saveData(key, data) {
  try {
    const jsonData = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonData);
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Load data from AsyncStorage
export async function loadData(key) {
  try {
    const jsonData = await AsyncStorage.getItem(key);
    if (jsonData !== null) {
      return JSON.parse(jsonData);
    }
    return null;
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
}

// Remove data from AsyncStorage
export async function removeData(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing data:', error);
  }
}
