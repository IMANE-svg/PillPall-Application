import axios from 'axios';
import { getAuthHeaders } from './auth';

const API_URL = 'http://192.168.1.11:8080/api/admin';
const SPECIALTY_URL = 'http://192.168.1.11:8080/api/specialties';

const adminApi = axios.create({
  baseURL: API_URL,
});

const specialtyApi = axios.create({
  baseURL: SPECIALTY_URL,
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


 export const deleteDoctor = async (id) => {
   const headers = await getAuthHeaders();
   return adminApi.delete(`/doctors/${id}`, { headers });
 };

export const getPatients = async () => {
  const headers = await getAuthHeaders();
  return adminApi.get('/patients', { headers });
};




export const updatePatient = async (id, data) => {
  const headers = await getAuthHeaders();
  return adminApi.put(`/patients/${id}`, data, { headers });
};


 export const deletePatient = async (id) => {
   const headers = await getAuthHeaders();
  return adminApi.delete(`/patients/${id}`, { headers });
 };

export const getSpecialties = async () => {
  const headers = await getAuthHeaders();
  return specialtyApi.get('/public', { headers });
};

export const addSpecialty = async (data) => {
  const headers = await getAuthHeaders();
  return specialtyApi.post('', data, { headers });
};

export const updateSpecialty = async (id, data) => {
  const headers = await getAuthHeaders();
  return specialtyApi.put(`/${id}`, data, { headers });
};

export const deleteSpecialty = async (id) => {
  const headers = await getAuthHeaders();
  return specialtyApi.delete(`/${id}`, { headers });
};

export const updateUserStatus = async (id, enabled) => {
  const headers = await getAuthHeaders();
  return adminApi.put(`/users/${id}/status`, { enabled }, { headers });
};

export const deleteUser = async (id) => {
  const headers = await getAuthHeaders();
  return adminApi.delete(`/users/${id}`, { headers });
};