import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllRecords, deleteRecord } from '../store/recordsSlice';
import { selectAllPatients } from '../store/patientSlice';
import { selectTheme } from '../store/themeSlice';
import { getTheme } from '../theme/tokens';

export default function RecordsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  
  const records = useSelector(selectAllRecords);
  const patients = useSelector(selectAllPatients);
  const themeMode = useSelector(selectTheme);
  const theme = getTheme(themeMode);
  const dispatch = useDispatch();

  // Get patient name by ID
  const getPatientName = (patientId) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.name : 'Unknown';
  };

  // Get color for AI result
  const getResultColor = (result) => {
    if (result === 'Normal') {
      return theme.success;
    }
    if (result === 'Needs Review') {
      return theme.warning;
    }
    return theme.danger;
  };

  // Filter records
  const filteredRecords = records.filter((record) => {
    // Filter by selected patient
    if (selectedPatientId && record.patientId !== selectedPatientId) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const patientName = getPatientName(record.patientId).toLowerCase();
      const date = new Date(record.timestamp).toLocaleDateString().toLowerCase();
      
      return patientName.includes(query) || date.includes(query);
    }
    
    return true;
  });

  const handleDelete = (recordId) => {
    dispatch(deleteRecord(recordId));
  };

  const renderRecord = ({ item }) => (
    <View style={[styles.recordCard, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
      <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
      
      <View style={styles.recordInfo}>
        <Text style={[styles.patientName, { color: theme.text }]}>
          {getPatientName(item.patientId)}
        </Text>
        
        <View style={[
          styles.resultBadge, 
          { backgroundColor: getResultColor(item.aiResult) }
        ]}>
          <Text style={styles.resultText}>
            {item.aiResult === 'Normal' && '✓ '}
            {item.aiResult === 'Needs Review' && '⚠ '}
            {item.aiResult === 'High Risk' && '⚠ '}
            {item.aiResult}
          </Text>
        </View>
        
        <Text style={[styles.explanation, { color: theme.textSecondary }]} numberOfLines={2}>
          {item.aiExplanation}
        </Text>
        
        <Text style={[styles.date, { color: theme.textSecondary }]}>
          📅 {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.deleteButton, { backgroundColor: theme.dangerLight }]}
        onPress={() => handleDelete(item.id)}
      >
        <Text style={[styles.deleteText, { color: theme.danger }]}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        No records found
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TextInput
        style={[styles.searchInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
        placeholder="Search by patient or date..."
        placeholderTextColor={theme.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { borderColor: theme.border },
            !selectedPatientId && { backgroundColor: theme.primary, borderColor: theme.primary }
          ]}
          onPress={() => setSelectedPatientId(null)}
        >
          <Text style={[
            styles.filterText,
            { color: !selectedPatientId ? '#FFFFFF' : theme.text }
          ]}>
            All
          </Text>
        </TouchableOpacity>
        
        {patients.slice(0, 3).map((patient) => (
          <TouchableOpacity
            key={patient.id}
            style={[
              styles.filterButton,
              { borderColor: theme.border },
              selectedPatientId === patient.id && { backgroundColor: theme.primary, borderColor: theme.primary }
            ]}
            onPress={() => setSelectedPatientId(patient.id)}
          >
            <Text style={[
              styles.filterText,
              { color: selectedPatientId === patient.id ? '#FFFFFF' : theme.text }
            ]} numberOfLines={1}>
              {patient.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <FlatList
        data={filteredRecords}
        renderItem={renderRecord}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[styles.listContent, { paddingBottom: 80 }]}
      />
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 10,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  recordCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginRight: 14,
  },
  recordInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  resultBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 6,
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  explanation: {
    fontSize: 12,
    marginBottom: 6,
    lineHeight: 16,
  },
  date: {
    fontSize: 11,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteText: {
    fontSize: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
  },
});
