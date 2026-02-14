import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { selectTheme } from '../store/themeSlice';
import { getTheme } from '../theme/tokens';
import authService from '../services/firebase/authService';

export default function EmailVerificationScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const themeMode = useSelector(selectTheme);
  const theme = getTheme(themeMode);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setUserEmail(user.email);
    }
  }, []);

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await authService.sendVerificationEmail();
      Alert.alert('Success', 'Verification email sent! Please check your inbox.');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      await authService.reloadUser();
      const isVerified = authService.isEmailVerified();
      
      if (isVerified) {
        Alert.alert(
          'Email Verified!',
          'Your email has been verified successfully. You can now use the app.',
          [
            {
              text: 'Continue',
              onPress: () => navigation.replace('Login')
            }
          ]
        );
      } else {
        Alert.alert(
          'Not Verified Yet',
          'Please check your email and click the verification link. It may take a few moments to update.'
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to check verification status');
    } finally {
      setChecking(false);
    }
  };

  const handleBackToLogin = async () => {
    try {
      await authService.logout();
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
      navigation.replace('Login');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
          <Text style={styles.icon}>📧</Text>
        </View>
        
        <Text style={[styles.title, { color: theme.text }]}>Verify Your Email</Text>
        
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          We've sent a verification email to:
        </Text>
        
        <Text style={[styles.email, { color: theme.primary }]}>
          {userEmail}
        </Text>
        
        <Text style={[styles.instructions, { color: theme.textSecondary }]}>
          Please check your inbox and click the verification link to activate your account.
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleCheckVerification}
          disabled={checking}
        >
          {checking ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>I've Verified My Email</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: theme.border }]}
          onPress={handleResendEmail}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>
              Resend Verification Email
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleBackToLogin}
        >
          <Text style={[styles.linkText, { color: theme.textSecondary }]}>
            Back to Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  linkButton: {
    padding: 12,
  },
  linkText: {
    fontSize: 16,
  },
});
