import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginAsync, selectAuthLoading, selectAuthError } from '../store/authSlice';
import { selectTheme } from '../store/themeSlice';
import { getTheme } from '../theme/tokens';
import { validateAuthCredentials } from '../utils/validation';
import authService from '../services/firebase/authService';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  
  const dispatch = useDispatch();
  const themeMode = useSelector(selectTheme);
  const theme = getTheme(themeMode);
  const loading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);

  const handleLogin = async () => {
    // Validate inputs
    const validation = validateAuthCredentials(email, password);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setErrors({});
    
    try {
      // Dispatch Firebase login action
      await dispatch(loginAsync({ email, password })).unwrap();
      
      // Check if email is verified
      await authService.reloadUser();
      const isVerified = authService.isEmailVerified();
      
      if (!isVerified) {
        setShowVerificationPrompt(true);
        Alert.alert(
          'Email Not Verified',
          'Please verify your email address before logging in. Check your inbox for the verification link.',
          [
            {
              text: 'Resend Email',
              onPress: handleResendVerification
            },
            {
              text: 'OK',
              style: 'cancel'
            }
          ]
        );
        // Sign out the user since email is not verified
        await authService.logout();
      }
      // Navigation will happen automatically when auth state changes
    } catch (error) {
      Alert.alert('Login Failed', error);
    }
  };

  const handleResendVerification = async () => {
    try {
      await authService.sendVerificationEmail();
      Alert.alert('Success', 'Verification email sent! Please check your inbox.');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send verification email');
    }
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: theme.primaryLight }]}>
            <Text style={styles.logo}>🏥</Text>
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Sign in to continue
          </Text>
        </View>
        
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              placeholder="Enter your email"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
            {errors.username && <Text style={styles.error}>{errors.username}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Password</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              placeholder="Enter your password"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
            {errors.password && <Text style={styles.error}>{errors.password}</Text>}
          </View>
          
          {authError && (
            <Text style={styles.error}>{authError}</Text>
          )}
          
          {showVerificationPrompt && (
            <View style={[styles.verificationBanner, { backgroundColor: theme.warning || '#FEF3C7', borderColor: theme.warningBorder || '#F59E0B' }]}>
              <Text style={[styles.verificationText, { color: theme.warningText || '#92400E' }]}>
                ⚠️ Email verification required
              </Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.primary, shadowColor: theme.shadow }]} 
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>
          
          <TouchableOpacity 
            style={[styles.secondaryButton, { borderColor: theme.border }]}
            onPress={handleSignup}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>
              Create New Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 56,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  error: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  secondaryButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  verificationBanner: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'center',
  },
  verificationText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
