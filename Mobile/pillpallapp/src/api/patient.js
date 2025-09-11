import axios from 'axios';
import { getAuthHeaders } from './auth';

const API_URL = 'http://192.168.1.11:8080';

const patientApi = axios.create({
  baseURL: API_URL,
});

export const getPatientDashboard = async () => {
  const headers = await getAuthHeaders();
  return patientApi.get('/api/patient/dashboard', { headers });
};

export const getMedications = async () => {
  const headers = await getAuthHeaders();
  return patientApi.get('/api/patient/prescriptions/active', { headers });
};

export const getIntakes = async () => {
  const headers = await getAuthHeaders();
  return patientApi.get('/api/patient/history', { headers });
};

export const confirmIntake = async (intakeId) => {
  const headers = await getAuthHeaders();
  return patientApi.post(`/intakes/${intakeId}/confirm`, {}, { headers });
};

export const getProfile = async () => {
  const headers = await getAuthHeaders();
  return patientApi.get('/api/patient/me', { headers });
};

export const updateProfile = async (data) => {
  const headers = await getAuthHeaders();
  return patientApi.put('/api/patient/me', data, { headers });
};

export const getContacts = async () => {
  const headers = await getAuthHeaders();
  return patientApi.get('/users/me/contacts', { headers });
};

export const addContact = async (data) => {
  const headers = await getAuthHeaders();
  return patientApi.post('/users/me/contacts', data, { headers });
};

export const updateContact = async (id, data) => {
  const headers = await getAuthHeaders();
  return patientApi.put(`/users/me/contacts/${id}`, data, { headers });
};

export const deleteContact = async (id) => {
  const headers = await getAuthHeaders();
  return patientApi.delete(`/users/me/contacts/${id}`, { headers });
};

export const addDoctor = async (doctorId) => {
  const headers = await getAuthHeaders();
  return patientApi.post(`/api/patient/doctors/${doctorId}`, {}, { headers });
};

export const removeDoctor = async (doctorId) => {
  const headers = await getAuthHeaders();
  return patientApi.delete(`/api/patient/doctors/${doctorId}`, { headers });
};

export const getPublicDoctors = async () => {
  const headers = await getAuthHeaders();
  return patientApi.get('/api/doctor/public', { headers });
};

export const getPatientDoctors = async () => {
  const headers = await getAuthHeaders();
  return patientApi.get('/api/patient/doctors', { headers });
};