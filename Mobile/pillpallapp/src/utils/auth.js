import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

export const getUserRole = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) return null;
  const decoded = jwtDecode(token);
  return decoded.roles[0]; // ROLE_DOCTOR, ROLE_PATIENT, ROLE_ADMIN
};

export const logout = async () => {
  await AsyncStorage.removeItem('token');
};