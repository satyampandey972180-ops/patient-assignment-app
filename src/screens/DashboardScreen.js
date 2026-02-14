import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { selectTotalPatients } from '../store/patientSlice';
import { selectRecentUploadsCount } from '../store/recordsSlice';
import { selectTheme } from '../store/themeSlice';
import { getTheme } from '../theme/tokens';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const totalPatients = useSelector(selectTotalPatients);
  const recentUploads = useSelector(selectRecentUploadsCount);
  const themeMode = useSelector(selectTheme);
  const theme = getTheme(themeMode);

  const navigateToPatients = () => {
    navigation.navigate('PatientsTab');
  };

  const navigateToRecords = () => {
    navigation.navigate('Records');
  };

  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: theme.textSecondary }]}>Welcome back!</Text>
        <Text style={[styles.title, { color: theme.text }]}>Dashboard</Text>
      </View>
      
      <View style={styles.metricsContainer}>
        <View style={[styles.metricCard, { backgroundColor: theme.primary, shadowColor: theme.shadow }]}>
          <Text style={styles.metricIcon}>👥</Text>
          <Text style={styles.metricValue}>{totalPatients}</Text>
          <Text style={styles.metricLabel}>Total Patients</Text>
        </View>
        
        <View style={[styles.metricCard, { backgroundColor: theme.secondary, shadowColor: theme.shadow }]}>
          <Text style={styles.metricIcon}>📸</Text>
          <Text style={styles.metricValue}>{recentUploads}</Text>
          <Text style={styles.metricLabel}>Recent Uploads</Text>
        </View>
      </View>
      
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
      
      <TouchableOpacity 
        style={[styles.actionCard, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}
        onPress={navigateToPatients}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
          <Text style={styles.actionIcon}>🏥</Text>
        </View>
        <View style={styles.actionContent}>
          <Text style={[styles.actionTitle, { color: theme.text }]}>Manage Patients</Text>
          <Text style={[styles.actionDescription, { color: theme.textSecondary }]}>
            Add, edit, or view patient records
          </Text>
        </View>
        <Text style={[styles.arrow, { color: theme.primary }]}>›</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.actionCard, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}
        onPress={navigateToRecords}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: theme.accentLight }]}>
          <Text style={styles.actionIcon}>📋</Text>
        </View>
        <View style={styles.actionContent}>
          <Text style={[styles.actionTitle, { color: theme.text }]}>View Records</Text>
          <Text style={[styles.actionDescription, { color: theme.textSecondary }]}>
            Browse medical images and AI results
          </Text>
        </View>
        <Text style={[styles.arrow, { color: theme.accent }]}>›</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.actionCard, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}
        onPress={navigateToSettings}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: theme.infoLight }]}>
          <Text style={styles.actionIcon}>⚙️</Text>
        </View>
        <View style={styles.actionContent}>
          <Text style={[styles.actionTitle, { color: theme.text }]}>Settings</Text>
          <Text style={[styles.actionDescription, { color: theme.textSecondary }]}>
            Customize app preferences
          </Text>
        </View>
        <Text style={[styles.arrow, { color: theme.info }]}>›</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 25,
  },
  greeting: {
    fontSize: 16,
    marginBottom: 5,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  metricCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  metricIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 15,
  },
  actionCard: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  arrow: {
    fontSize: 32,
    fontWeight: '300',
  },
});
