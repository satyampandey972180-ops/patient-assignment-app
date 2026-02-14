import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { selectTheme } from '../store/themeSlice';
import { getTheme } from '../theme/tokens';
import PatientsListScreen from '../screens/PatientsListScreen';
import AddEditPatientScreen from '../screens/AddEditPatientScreen';
import ViewPatientScreen from '../screens/ViewPatientScreen';
import ImageCaptureScreen from '../screens/ImageCaptureScreen';

const Stack = createNativeStackNavigator();

export default function PatientsStack() {
  const themeMode = useSelector(selectTheme);
  const theme = getTheme(themeMode);
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="PatientsList" 
        component={PatientsListScreen}
        options={{ title: 'Patients' }}
      />
      <Stack.Screen 
        name="AddEditPatient" 
        component={AddEditPatientScreen}
        options={{ title: 'Patient Details' }}
      />
      <Stack.Screen 
        name="ViewPatient" 
        component={ViewPatientScreen}
        options={{ title: 'Patient Info' }}
      />
      <Stack.Screen 
        name="ImageCapture" 
        component={ImageCaptureScreen}
        options={{ title: 'Capture Image' }}
      />
    </Stack.Navigator>
  );
}
