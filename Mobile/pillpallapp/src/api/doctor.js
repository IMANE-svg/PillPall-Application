import axios from 'axios';
import { getAuthHeaders } from './auth';

const API_URL = 'http://192.168.1.11:8080/api/doctor';

const doctorApi = axios.create({
  baseURL: API_URL,
});

export const getDoctorStats = async () => {
  const headers = await getAuthHeaders();
  return doctorApi.get('/dashboard/stats', { headers });
};

export const getPrescriptionsByPatient = async (patientId) => {
  const headers = await getAuthHeaders();
  return doctorApi.get(`/prescriptions/patient/${patientId}`, { headers });
};

export const createPrescription = async (data) => {
  const headers = await getAuthHeaders();
  return doctorApi.post('/prescriptions', data, { headers });
};

export const updatePrescription = async (id, data) => {
  const headers = await getAuthHeaders();
  return doctorApi.put(`/prescriptions/${id}`, data, { headers });
};

export const deletePrescription = async (id) => {
  const headers = await getAuthHeaders();
  return doctorApi.delete(`/prescriptions/${id}`, { headers });
};

export const getPatients = async () => {
  const headers = await getAuthHeaders();
  return doctorApi.get('/patients', { headers });
};

export const getObservance = async (patientId) => {
  const headers = await getAuthHeaders();
  return doctorApi.get(`/observance/${patientId}`, { headers });
};

export const generateReport = async (patientId, from, to) => {
  const headers = await getAuthHeaders();
  return doctorApi.get(`/reports/${patientId}?from=${from}&to=${to}`, { headers });
};

export const getHistory = async () => {
  const headers = await getAuthHeaders();
  return doctorApi.get('/prescriptions/history', { headers });
};