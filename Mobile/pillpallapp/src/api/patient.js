import axios from 'axios';
import { getAuthHeaders } from './auth';

const API_URL = 'http://192.168.1.11:8080/api/patient';

const patientApi = axios.create({
  baseURL: API_URL,
});

export const getPatientDashboard = async () => {
  const headers = await getAuthHeaders();
  return patientApi.get('/dashboard', { headers });
};

export const getMedications = async () => {
  const headers = await getAuthHeaders();
  return patientApi.get('/prescriptions', { headers });
};

export const getIntakes = async () => {
  const headers = await getAuthHeaders();
  return patientApi.get('/intakes', { headers });
};

export const confirmIntake = async (intakeId) => {
  const headers = await getAuthHeaders();
  return patientApi.post(`/intakes/${intakeId}/confirm`, {}, { headers });
};

export const getProfile = async () => {
  const headers = await getAuthHeaders();
  return patientApi.get('/me', { headers });
};

export const updateProfile = async (data) => {
  const headers = await getAuthHeaders();
  return patientApi.put('/me', data, { headers });
};

export const getContacts = async () => {
  const headers = await getAuthHeaders();
  return patientApi.get('/contacts', { headers });
};

export const addContact = async (data) => {
  const headers = await getAuthHeaders();
  return patientApi.post('/contacts', data, { headers });
};

export const updateContact = async (id, data) => {
  const headers = await getAuthHeaders();
  return patientApi.put(`/contacts/${id}`, data, { headers });
};

export const deleteContact = async (id) => {
  const headers = await getAuthHeaders();
  return patientApi.delete(`/contacts/${id}`, { headers });
};

export const addDoctor = async (doctorId) => {
  const headers = await getAuthHeaders();
  return patientApi.post(`/doctors/${doctorId}`, {}, { headers });
};

export const removeDoctor = async (doctorId) => {
  const headers = await getAuthHeaders();
  return patientApi.delete(`/doctors/${doctorId}`, { headers });
};