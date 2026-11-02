
import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';

import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert('Missing details', 'Please fill in all fields.');
      return;
    }

    if (fullName.trim().length < 3) {
      Alert.alert('Invalid name', 'Name must contain at least 3 characters.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must contain at least 8 characters.');
      return;
    }

    if (!/[a-z]/.test(password)) {
      Alert.alert('Weak password', 'Add at least one lowercase letter.');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      Alert.alert('Weak password', 'Add at least one uppercase letter.');
      return;
    }

    if (!/[0-9]/.test(password)) {
      Alert.alert('Weak password', 'Add at least one number.');
      return;
    }

    try {
      setLoading(true);

      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      Alert.alert(
        'Welcome to LifeTrack',
        'Your account has been created!'
      );
    } catch (error: any) {
      console.log('Registration error:', error);
      console.log('Server response:', error.response?.data);

      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.message ||
        'Unable to create your account.';

      Alert.alert('Registration Failed', serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000000"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>LifeTrack.</Text>

          <View style={styles.headingContainer}>
            <Text style={styles.title}>Create your</Text>
            <Text style={styles.title}>account.</Text>
          </View>

          <Text style={styles.subtitle}>
            One place to manage everything in your life.
          </Text>
        </View>

        {/* Registration Form */}
        <View style={styles.form}>
          <AppInput
            label="FULL NAME"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
          />

          <AppInput
            label="EMAIL ADDRESS"
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <AppInput
            label="PASSWORD"
            placeholder="Create a strong password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.passwordHint}>
            At least 8 characters, including uppercase,
            lowercase and a number.
          </Text>

          <View style={styles.buttonContainer}>
            <AppButton
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
            />
          </View>

          {/* Login Navigation */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Already have an account?
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          BY CONTINUING, YOU AGREE TO OUR TERMS AND PRIVACY POLICY.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingTop: 35,
    paddingBottom: 25,
  },

  header: {
    marginBottom: 30,
  },

  logo: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 35,
  },

  headingContainer: {
    marginBottom: 12,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 35,
    fontWeight: '800',
    letterSpacing: -1.5,
    lineHeight: 42,
  },

  subtitle: {
    color: '#A3A3A3',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },

  form: {
    width: '100%',
  },

  passwordHint: {
    color: '#777777',
    fontSize: 11,
    lineHeight: 17,
    marginTop: -8,
    marginBottom: 15,
  },

  buttonContainer: {
    marginTop: 5,
  },

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 27,
    gap: 5,
  },

  loginText: {
    color: '#999999',
    fontSize: 14,
  },

  loginLink: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

  footer: {
    color: '#555555',
    fontSize: 9,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 35,
    lineHeight: 16,
  },
});
