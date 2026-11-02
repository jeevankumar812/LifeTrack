
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';

import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Please enter your email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);

      await login({
        email: email.trim(),
        password,
      });

      console.log('Login successful!');
    } catch (error: any) {
      console.log('Login error:', error);
      console.log('Server response:', error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.message ||
        'Unable to login. Please try again.';

      Alert.alert('Login Failed', errorMessage);
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
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

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
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.title}>back.</Text>
          </View>

          <Text style={styles.subtitle}>
            Sign in to continue your journey.
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <AppInput
            label="EMAIL ADDRESS"
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <AppInput
            label="PASSWORD"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.forgotContainer}
            onPress={() =>
              Alert.alert(
                'Forgot Password',
                'Password recovery will be available soon.'
              )
            }
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <AppButton
              title="Login"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
            />
          </View>

          {/* Register Navigation */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Don't have an account?
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
            >
              <Text style={styles.registerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          YOUR LIFE. YOUR GOALS. YOUR TRACKER.
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
    marginBottom: 35,
  },

  logo: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 40,
  },

  headingContainer: {
    marginBottom: 12,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1.5,
    lineHeight: 48,
  },

  subtitle: {
    color: '#A3A3A3',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 8,
  },

  form: {
    width: '100%',
  },

  forgotContainer: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 24,
  },

  forgotText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  buttonContainer: {
    marginTop: 5,
  },

  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 27,
    gap: 5,
  },

  registerText: {
    color: '#999999',
    fontSize: 14,
  },

  registerLink: {
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
    marginTop: 40,
  },
});
