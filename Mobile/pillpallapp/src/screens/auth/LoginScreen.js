import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { login, getUserRole } from '../../api/auth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting login with:', email);
      const token = await login(email, password);
      console.log('Login successful, token:', token);
      
      const role = await getUserRole();
      console.log('User role:', role);
      
      if (role === 'ROLE_DOCTOR') {
        navigation.replace('Doctor');
      } else if (role === 'ROLE_PATIENT') {
        navigation.replace('Patient');
      } else if (role === 'ROLE_ADMIN') {
        navigation.replace('Admin');
      } else {
        Alert.alert('Erreur', 'Rôle inconnu: ' + role);
      }
    } catch (error) {
      console.log('Login failed:', error);
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          'Email ou mot de passe incorrect';
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/health-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      
      <Text style={styles.title}>Connexion</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Se connecter</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerLink}>Pas de compte ? Inscrivez-vous</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 16
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 24
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 24,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#1E40AF',
    padding: 12,
    marginBottom: 16,
    borderRadius: 6,
    fontSize: 16,
    backgroundColor: '#FFFFFF'
  },
  loginButton: {
    backgroundColor: '#1E40AF',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8
  },
  loginButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  registerLink: {
    color: '#1E40AF',
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14
  },
});

export default LoginScreen;