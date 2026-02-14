import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { selectTheme } from '../store/themeSlice';
import { getTheme } from '../theme/tokens';
import { useRBAC } from '../hooks/useRBAC';
import DashboardScreen from '../screens/DashboardScreen';
import PatientsStack from './PatientsStack';
import RecordsScreen from '../screens/RecordsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import UserManagementScreen from '../screens/UserManagementScreen';

const Tab = createBottomTabNavigator();

// Simple icon component using emojis
const TabIcon = ({ emoji, focused }) => (
  <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.6 }}>
    {emoji}
  </Text>
);

export default function MainTabs() {
  const insets = useSafeAreaInsets();
  const themeMode = useSelector(selectTheme);
  const theme = getTheme(themeMode);
  const { canManageUsers } = useRBAC();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          backgroundColor: theme.surface,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarHideOnKeyboard: true,
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ 
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />
        }}
      />
      <Tab.Screen 
        name="PatientsTab" 
        component={PatientsStack}
        options={{ 
          title: 'Patients', 
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon emoji="👥" focused={focused} />
        }}
      />
      <Tab.Screen 
        name="Records" 
        component={RecordsScreen}
        options={{ 
          title: 'Records',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />
        }}
      />
      {canManageUsers && (
        <Tab.Screen 
          name="Users" 
          component={UserManagementScreen}
          options={{ 
            title: 'Users',
            tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />
          }}
        />
      )}
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ 
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />
        }}
      />
    </Tab.Navigator>
  );
}
