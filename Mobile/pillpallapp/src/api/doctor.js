import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.11:8080'; 

const doctorApi = axios.create({
  baseURL: API_URL,
});

export const getDoctorStats = async () => {
  const headers = await getAuthHeaders();
  return doctorApi.get('/api/doctor/dashboard/stats', { headers });
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
  return doctorApi.get('/api/doctor/patients', { headers });
};

export const getObservance = async (patientId, days = 7) => {
  const headers = await getAuthHeaders();
  return doctorApi.get(`/api/doctor/patients/${patientId}/observance?days=${days}`, { headers });
};

export const generateReport = async (patientId, from, to) => {
  const headers = await getAuthHeaders();
  return doctorApi.get(`/api/doctor/reports/${patientId}?from=${from}&to=${to}`, { headers });
};

export const getHistory = async () => {
  const headers = await getAuthHeaders();
  return doctorApi.get('/api/doctor/prescriptions/history', { headers });
};

export const scanPrescription = async (patientId, file) => {
  const headers = await getAuthHeaders();
  const formData = new FormData();
  formData.append('file', file);
  return doctorApi.post(`/prescriptions/scan?patientId=${patientId}`, formData, {
    headers: { ...headers, 'Content-Type': 'multipart/form-data' },
  });
};

export const downloadReportPdf = async (patientId, from, to) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('Aucun token trouvé');
    }
    const response = await axios.get(`${API_URL}/api/doctor/reports/${patientId}/pdf`, {
      params: { from, to },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer', // Pour gérer les fichiers binaires
    });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    return { data: base64, headers: response.headers };
  } catch (error) {
    console.error('Erreur downloadReportPdf:', error.response?.data || error.message);
    throw error;
  }
};

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    throw new Error('Aucun token trouvé');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};