import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectTheme, toggleTheme } from '../store/themeSlice';
import { selectUser, logout } from '../store/authSlice';
import { getTheme } from '../theme/tokens';

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const themeMode = useSelector(selectTheme);
  const user = useSelector(selectUser);
  const theme = getTheme(themeMode);
  
  const isDarkMode = themeMode === 'dark';

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
          },
        },
      ]
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Profile</Text>
        
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text }]}>Username</Text>
          <Text style={[styles.value, { color: theme.textSecondary }]}>
            {user ? user.username : 'Guest'}
          </Text>
        </View>
      </View>
      
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
        
        <View style={styles.row}>
          <View>
            <Text style={[styles.label, { color: theme.text }]}>Dark Mode</Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              {isDarkMode ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={handleThemeToggle}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
      
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
        
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text }]}>Version</Text>
          <Text style={[styles.value, { color: theme.textSecondary }]}>1.0.0</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text }]}>App Name</Text>
          <Text style={[styles.value, { color: theme.textSecondary }]}>
            Patient Assignment App
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: theme.danger }]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    marginTop: 2,
  },
  logoutButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
