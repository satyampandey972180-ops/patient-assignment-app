import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { signupAsync } from '../store/authSlice';
import { selectTheme } from '../store/themeSlice';
import { getTheme } from '../theme/tokens';
import { validateAuthCredentials } from '../utils/validation';
import { ROLES } from '../services/rbac/rbacService';
import authService from '../services/firebase/authService';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES.NURSE);
  const [errors, setErrors] = useState({});
  
  const dispatch = useDispatch();
  const themeMode = useSelector(selectTheme);
  const theme = getTheme(themeMode);

  const roles = [
    { value: ROLES.ADMIN, label: 'Administrator', description: 'Full access + user management' },
    { value: ROLES.DOCTOR, label: 'Doctor', description: 'Manage patients and records' },
    { value: ROLES.NURSE, label: 'Nurse', description: 'View patients, add records' },
  ];

  const handleSignup = async () => {
    // Validate inputs
    const validation = validateAuthCredentials(email, password);
    const newErrors = { ...validation.errors };
    
    // Check if passwords match
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!validation.isValid || password !== confirmPassword) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    
    try {
      // Dispatch Firebase signup action
      await dispatch(signupAsync({ email, password, role: selectedRole })).unwrap();
      
      // Sign out the user immediately after signup
      // They must verify email before they can login
      await authService.logout();
      
      // Navigate to email verification screen
      navigation.replace('EmailVerification');
    } catch (error) {
      Alert.alert('Signup Failed', error);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.text }]}>Sign Up</Text>
        
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder="Email"
          placeholderTextColor={theme.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {errors.username && <Text style={styles.error}>{errors.username}</Text>}
        
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder="Password"
          placeholderTextColor={theme.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        {errors.password && <Text style={styles.error}>{errors.password}</Text>}
        
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder="Confirm Password"
          placeholderTextColor={theme.textSecondary}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}
        
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Role</Text>
        
        {roles.map((role) => (
          <TouchableOpacity
            key={role.value}
            style={[
              styles.roleCard,
              { 
                backgroundColor: theme.surface, 
                borderColor: selectedRole === role.value ? theme.primary : theme.border,
                borderWidth: selectedRole === role.value ? 2 : 1,
              }
            ]}
            onPress={() => setSelectedRole(role.value)}
          >
            <View style={styles.roleHeader}>
              <View style={[
                styles.radioButton,
                { borderColor: theme.primary }
              ]}>
                {selectedRole === role.value && (
                  <View style={[styles.radioButtonInner, { backgroundColor: theme.primary }]} />
                )}
              </View>
              <Text style={[styles.roleLabel, { color: theme.text }]}>{role.label}</Text>
            </View>
            <Text style={[styles.roleDescription, { color: theme.textSecondary }]}>
              {role.description}
            </Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primary }]} 
          onPress={handleSignup}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleLogin}>
          <Text style={[styles.link, { color: theme.primary }]}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 16,
  },
  error: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 10,
    marginLeft: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 15,
  },
  roleCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  roleDescription: {
    fontSize: 14,
    marginLeft: 36,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  link: {
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
  },
});
