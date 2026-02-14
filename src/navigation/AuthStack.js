import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { selectTheme } from '../store/themeSlice';
import { getTheme } from '../theme/tokens';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
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
        name="Login" 
        component={LoginScreen}
        options={{ title: 'Login' }}
      />
      <Stack.Screen 
        name="Signup" 
        component={SignupScreen}
        options={{ title: 'Sign Up' }}
      />
      <Stack.Screen 
        name="EmailVerification" 
        component={EmailVerificationScreen}
        options={{ 
          title: 'Verify Email',
          headerLeft: () => null, // Prevent going back
        }}
      />
    </Stack.Navigator>
  );
}
