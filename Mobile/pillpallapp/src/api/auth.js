import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

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
    console.log('Attempting login with email:', email);
    const response = await authApi.post('/login', { email, password });
    console.log('Login response:', JSON.stringify(response.data, null, 2));
    
    const token = response.data.token;
    
    if (!token) {
      throw new Error('No token received');
    }
    
    await AsyncStorage.setItem('token', token);
    console.log('Token stored successfully:', token);
    return token;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

// Register
export const register = async (data) => {
  try {
    console.log('Attempting register with data:', JSON.stringify(data, null, 2));
    const response = await authApi.post('/register', data);
    console.log('Register response:', JSON.stringify(response.data, null, 2));
    
    const token = response.data.token;
    
    if (!token) {
      throw new Error('No token received');
    }
    
    await AsyncStorage.setItem('token', token);
    console.log('Token stored successfully:', token);
    return token;
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message);
    throw error;
  }
};

// Récupérer les headers auth
export const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  console.log('Retrieved token for headers:', token || 'No token found');
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Récupérer le rôle depuis le token
export const getUserRole = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('Token to decode:', token || 'No token found');
    if (!token) return null;
    
    const decoded = jwtDecode(token);
    console.log('Decoded token:', JSON.stringify(decoded, null, 2));
    
    const roles = decoded.roles || [];
    console.log('User roles:', roles);
    
    return roles[0];
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};