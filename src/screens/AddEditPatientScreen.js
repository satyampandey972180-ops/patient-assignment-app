import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addPatient, updatePatient, selectPatientById } from '../store/patientSlice';
import { selectTheme } from '../store/themeSlice';
import { getTheme } from '../theme/tokens';
import { validatePatientData } from '../utils/validation';
import { useRBAC } from '../hooks/useRBAC';

export default function AddEditPatientScreen({ route, navigation }) {
  const { mode, patientId } = route.params || { mode: 'add' };
  const dispatch = useDispatch();
  const themeMode = useSelector(selectTheme);
  const theme = getTheme(themeMode);
  const { canCreatePatient, canUpdatePatient } = useRBAC();
  
  const existingPatient = useSelector((state) => 
    patientId ? selectPatientById(state, patientId) : null
  );

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Check permissions
    if (mode === 'add' && !canCreatePatient) {
      Alert.alert('Access Denied', 'You do not have permission to create patients');
      navigation.goBack();
      return;
    }
    if (mode === 'edit' && !canUpdatePatient) {
      Alert.alert('Access Denied', 'You do not have permission to edit patients');
      navigation.goBack();
      return;
    }

    if (mode === 'edit' && existingPatient) {
      setName(existingPatient.name);
      setAge(existingPatient.age.toString());
      setGender(existingPatient.gender);
      setContact(existingPatient.contact || '');
      setNotes(existingPatient.notes || '');
    }
  }, [mode, existingPatient, canCreatePatient, canUpdatePatient, navigation]);

  const handleSave = () => {
    const patientData = {
      name: name.trim(),
      age: parseInt(age),
      gender,
      contact: contact.trim(),
      notes: notes.trim(),
    };

    // Validate
    const validation = validatePatientData(patientData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});

    if (mode === 'add') {
      dispatch(addPatient(patientData));
      Alert.alert('Success', 'Patient added successfully');
    } else {
      dispatch(updatePatient({ id: patientId, updates: patientData }));
      Alert.alert('Success', 'Patient updated successfully');
    }

    navigation.goBack();
  };

  const selectGender = (selectedGender) => {
    setGender(selectedGender);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.label, { color: theme.text }]}>Name *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
        placeholder="Enter patient name"
        placeholderTextColor={theme.textSecondary}
        value={name}
        onChangeText={setName}
      />
      {errors.name && <Text style={styles.error}>{errors.name}</Text>}

      <Text style={[styles.label, { color: theme.text }]}>Age *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
        placeholder="Enter age"
        placeholderTextColor={theme.textSecondary}
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      {errors.age && <Text style={styles.error}>{errors.age}</Text>}

      <Text style={[styles.label, { color: theme.text }]}>Gender *</Text>
      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={[
            styles.genderButton,
            { borderColor: theme.border },
            gender === 'Male' && { backgroundColor: theme.primary, borderColor: theme.primary }
          ]}
          onPress={() => selectGender('Male')}
        >
          <Text style={[
            styles.genderText,
            { color: gender === 'Male' ? '#FFFFFF' : theme.text }
          ]}>
            Male
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.genderButton,
            { borderColor: theme.border },
            gender === 'Female' && { backgroundColor: theme.primary, borderColor: theme.primary }
          ]}
          onPress={() => selectGender('Female')}
        >
          <Text style={[
            styles.genderText,
            { color: gender === 'Female' ? '#FFFFFF' : theme.text }
          ]}>
            Female
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.genderButton,
            { borderColor: theme.border },
            gender === 'Other' && { backgroundColor: theme.primary, borderColor: theme.primary }
          ]}
          onPress={() => selectGender('Other')}
        >
          <Text style={[
            styles.genderText,
            { color: gender === 'Other' ? '#FFFFFF' : theme.text }
          ]}>
            Other
          </Text>
        </TouchableOpacity>
      </View>
      {errors.gender && <Text style={styles.error}>{errors.gender}</Text>}

      <Text style={[styles.label, { color: theme.text }]}>Contact</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
        placeholder="Phone or email"
        placeholderTextColor={theme.textSecondary}
        value={contact}
        onChangeText={setContact}
      />

      <Text style={[styles.label, { color: theme.text }]}>Notes</Text>
      <TextInput
        style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
        placeholder="Additional notes"
        placeholderTextColor={theme.textSecondary}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity 
        style={[styles.saveButton, { backgroundColor: theme.primary }]}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>
          {mode === 'add' ? 'Add Patient' : 'Update Patient'}
        </Text>
      </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingTop: 15,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  error: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 5,
    marginLeft: 5,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  genderText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
