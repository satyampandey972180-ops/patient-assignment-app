import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectPatientById, deletePatient } from '../store/patientSlice';
import { selectRecordsByPatient } from '../store/recordsSlice';
import { selectTheme } from '../store/themeSlice';
import { getTheme } from '../theme/tokens';
import { useRBAC } from '../hooks/useRBAC';

export default function ViewPatientScreen({ route, navigation }) {
  const { patientId } = route.params;
  const dispatch = useDispatch();
  const patient = useSelector((state) => selectPatientById(state, patientId));
  const records = useSelector((state) => selectRecordsByPatient(state, patientId));
  const themeMode = useSelector(selectTheme);
  const theme = getTheme(themeMode);
  const { canUpdatePatient, canDeletePatient } = useRBAC();

  if (!patient) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Patient not found</Text>
      </View>
    );
  }

  const handleEdit = () => {
    if (!canUpdatePatient) {
      Alert.alert('Access Denied', 'You do not have permission to edit patients');
      return;
    }
    navigation.navigate('AddEditPatient', { mode: 'edit', patientId });
  };

  const handleDelete = () => {
    if (!canDeletePatient) {
      Alert.alert('Access Denied', 'You do not have permission to delete patients');
      return;
    }
    Alert.alert(
      'Delete Patient',
      'Are you sure you want to delete this patient?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deletePatient(patientId));
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleCaptureImage = () => {
    navigation.navigate('ImageCapture', { patientId });
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Name</Text>
        <Text style={[styles.value, { color: theme.text }]}>{patient.name}</Text>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Age</Text>
        <Text style={[styles.value, { color: theme.text }]}>{patient.age} years</Text>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Gender</Text>
        <Text style={[styles.value, { color: theme.text }]}>{patient.gender}</Text>

        {patient.contact && (
          <>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Contact</Text>
            <Text style={[styles.value, { color: theme.text }]}>{patient.contact}</Text>
          </>
        )}

        {patient.notes && (
          <>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Notes</Text>
            <Text style={[styles.value, { color: theme.text }]}>{patient.notes}</Text>
          </>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Medical Images</Text>
        <Text style={[styles.recordCount, { color: theme.textSecondary }]}>
          {records.length} image{records.length !== 1 ? 's' : ''} captured
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={handleCaptureImage}
      >
        <Text style={styles.buttonText}>Capture Image</Text>
      </TouchableOpacity>

      {canUpdatePatient && (
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}
          onPress={handleEdit}
        >
          <Text style={[styles.buttonTextSecondary, { color: theme.text }]}>Edit Patient</Text>
        </TouchableOpacity>
      )}

      {canDeletePatient && (
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.danger }]}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>Delete Patient</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  recordCount: {
    fontSize: 14,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
  },
});
