import axios from 'axios';
import { getAuthHeaders } from './auth';

const API_URL = 'http://192.168.1.11:8080/api/admin';

const adminApi = axios.create({
  baseURL: API_URL,
});

export const getAdminStats = async () => {
  const headers = await getAuthHeaders();
  return adminApi.get('/stats', { headers });
};

export const getDoctors = async () => {
  const headers = await getAuthHeaders();
  return adminApi.get('/doctors', { headers });
};

export const updateDoctor = async (id, data) => {
  const headers = await getAuthHeaders();
  return adminApi.put(`/doctors/${id}`, data, { headers });
};

export const getPatientsByDoctor = async (doctorId) => {
  const headers = await getAuthHeaders();
  return adminApi.get(`/doctors/${doctorId}/patients`, { headers });
};

export const updatePatient = async (id, data) => {
  const headers = await getAuthHeaders();
  return adminApi.put(`/patients/${id}`, data, { headers });
};

export const getSpecialties = async () => {
  const headers = await getAuthHeaders();
  return adminApi.get('/specialties', { headers });
};

export const addSpecialty = async (data) => {
  const headers = await getAuthHeaders();
  return adminApi.post('/specialties', data, { headers });
};

export const updateSpecialty = async (id, data) => {
  const headers = await getAuthHeaders();
  return adminApi.put(`/specialties/${id}`, data, { headers });
};

export const deleteSpecialty = async (id) => {
  const headers = await getAuthHeaders();
  return adminApi.delete(`/specialties/${id}`, { headers });
};

export const updateUserStatus = async (id, enabled) => {
  const headers = await getAuthHeaders();
  return adminApi.put(`/users/${id}/status`, { enabled }, { headers });
};