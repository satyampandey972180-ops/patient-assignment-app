import React from 'react';
import { useSelector } from 'react-redux';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { selectIsAuthenticated } from '../store/authSlice';
import { selectTheme } from '../store/themeSlice';
import { getTheme } from '../theme/tokens';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

export default function RootNavigator() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const themeMode = useSelector(selectTheme);
  const theme = getTheme(themeMode);

  const navigationTheme = {
    ...(themeMode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(themeMode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
    },
  };

  return (
    <SafeAreaProvider style={{ backgroundColor: theme.background }}>
      <NavigationContainer theme={navigationTheme}>
        {isAuthenticated ? <MainTabs /> : <AuthStack />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
