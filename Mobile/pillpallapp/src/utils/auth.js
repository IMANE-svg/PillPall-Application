import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

export const getUserRole = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) return null;
  const decoded = jwtDecode(token);
  return decoded.roles[0]; // ROLE_DOCTOR, ROLE_PATIENT, ROLE_ADMIN
};

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    return token;
  } catch (error) {
    console.error('Erreur getToken:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem('token');
  } catch (error) {
    console.error('Erreur logout:', error);
    throw error;
  }
};