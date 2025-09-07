import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode'; // IMPORTANT: import nommé au lieu de par défaut

const API_URL = 'http://192.168.1.11:8080';

const authApi = axios.create({
  baseURL: `${API_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Login
export const login = async (email, password) => {
  try {
    const response = await authApi.post('/login', { email, password });
    console.log('Login response:', response.data);
    
    const token = response.data.token;
    
    if (!token) {
      throw new Error('No token received');
    }
    
    await AsyncStorage.setItem('token', token);
    return token;
  } catch (error) {
    console.log('Login error:', error.response?.data);
    throw error;
  }
};

// Register
export const register = async (data) => {
  try {
    const response = await authApi.post('/register', data);
    console.log('Register response:', response.data);
    
    const token = response.data.token;
    
    if (!token) {
      throw new Error('No token received');
    }
    
    await AsyncStorage.setItem('token', token);
    return token;
  } catch (error) {
    console.log('Register error:', error.response?.data);
    throw error;
  }
};

// Récupérer les headers auth
export const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Récupérer le rôle depuis le token - CORRIGÉ
export const getUserRole = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) return null;
    
    console.log('Token to decode:', token);
    
    // Utilisation correcte de jwtDecode
    const decoded = jwtDecode(token);
    console.log('Decoded token:', decoded);
    
    const roles = decoded.roles || [];
    console.log('User roles:', roles);
    
    return roles[0]; // Retourne le premier rôle
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};