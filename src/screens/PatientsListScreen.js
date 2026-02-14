import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { selectAllPatients } from '../store/patientSlice';
import { selectTheme } from '../store/themeSlice';
import { getTheme } from '../theme/tokens';
import { useRBAC } from '../hooks/useRBAC';

export default function PatientsListScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const patients = useSelector(selectAllPatients);
  const themeMode = useSelector(selectTheme);
  const theme = getTheme(themeMode);
  const { canCreatePatient } = useRBAC();

  // Filter patients by search query
  const filteredPatients = patients.filter((patient) => {
    if (!searchQuery) {
      return true;
    }
    const query = searchQuery.toLowerCase();
    return patient.name.toLowerCase().includes(query);
  });

  const handleAddPatient = () => {
    if (!canCreatePatient) {
      alert('Access Denied: You do not have permission to create patients');
      return;
    }
    navigation.navigate('AddEditPatient', { mode: 'add' });
  };

  const handleViewPatient = (patient) => {
    navigation.navigate('ViewPatient', { patientId: patient.id });
  };

  const renderPatient = ({ item }) => (
    <TouchableOpacity 
      style={[styles.patientCard, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}
      onPress={() => handleViewPatient(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.avatarContainer, { backgroundColor: theme.primaryLight }]}>
        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.patientDetails}>
        <Text style={[styles.patientName, { color: theme.text }]}>{item.name}</Text>
        <View style={styles.infoRow}>
          <View style={[styles.badge, { backgroundColor: theme.infoLight }]}>
            <Text style={[styles.badgeText, { color: theme.info }]}>
              {item.age} years
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: theme.accentLight }]}>
            <Text style={[styles.badgeText, { color: theme.accent }]}>
              {item.gender}
            </Text>
          </View>
        </View>
        {item.contact && (
          <Text style={[styles.patientContact, { color: theme.textSecondary }]}>
            📞 {item.contact}
          </Text>
        )}
      </View>
      <Text style={[styles.chevron, { color: theme.primary }]}>›</Text>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        No patients found
      </Text>
      <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
        {canCreatePatient ? 'Add your first patient to get started' : 'No patients available'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TextInput
        style={[styles.searchInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
        placeholder="Search patients..."
        placeholderTextColor={theme.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <FlatList
        data={filteredPatients}
        renderItem={renderPatient}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
      />
      
      {canCreatePatient && (
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={handleAddPatient}
        >
          <Text style={styles.addButtonText}>+ Add Patient</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInput: {
    height: 50,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    margin: 16,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  patientCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  patientContact: {
    fontSize: 13,
    marginTop: 2,
  },
  chevron: {
    fontSize: 32,
    fontWeight: '300',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 30,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
