import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('passenger');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      await dispatch(login({ email, password, role })).unwrap();
      // Navigation handled by AppNavigator based on auth state
    } catch (error) {
      Alert.alert('Login Failed', error?.message || 'Something went wrong');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Bus Ticketing</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
          {/* Role Selector */}
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'passenger' && styles.roleButtonActive]}
              onPress={() => setRole('passenger')}
            >
              <Text style={[styles.roleText, role === 'passenger' && styles.roleTextActive]}>
                Passenger
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'conductor' && styles.roleButtonActive]}
              onPress={() => setRole('conductor')}
            >
              <Text style={[styles.roleText, role === 'conductor' && styles.roleTextActive]}>
                Conductor
              </Text>
            </TouchableOpacity>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Icon name="email" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Loading...' : 'Login'}
            </Text>
          </TouchableOpacity>

          {/* Register Link for Passengers */}
          {role === 'passenger' && (
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerText}>
                Don't have an account? <Text style={styles.registerTextBold}>Register</Text>
              </Text>
            </TouchableOpacity>
          )}

          {error && (
            <Text style={styles.errorText}>{error.message}</Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E88E5',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 5,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  roleButtonActive: {
    backgroundColor: '#1E88E5',
  },
  roleText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  roleTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#1E88E5',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: '#90CAF9',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerTextBold: {
    color: '#1E88E5',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
    marginTop: 10,
  },
});