import React from 'react';
import Footer from '../components/Footer';
import DoctorHomeScreen from '../screens/doctor/DoctorHomeScreen';
import PrescriptionScreen from '../screens/doctor/PrescriptionScreen';
import PatientsScreen from '../screens/doctor/PatientScreen';
import ObservanceScreen from '../screens/doctor/ObservanceScreen';
import ReportScreen from '../screens/doctor/ReportScreen';
import HistoryScreen from '../screens/doctor/HistoryScreen';

const screens = [
  { name: 'Accueil', component: DoctorHomeScreen, icon: 'home' },
  { name: 'Prescriptions', component: PrescriptionScreen, icon: 'description' },
  { name: 'Patients', component: PatientsScreen, icon: 'people' },
  { name: 'Observance', component: ObservanceScreen, icon: 'check-circle' },
  { name: 'Rapport', component: ReportScreen, icon: 'bar-chart' },
  { name: 'Historique', component: HistoryScreen, icon: 'history' },
];

const DoctorNavigator = () => {
  return <Footer screens={screens} role="doctor" />;
};

export default DoctorNavigator;