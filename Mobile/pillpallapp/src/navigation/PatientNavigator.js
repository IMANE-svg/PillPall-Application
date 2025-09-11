import React from 'react';
import PatientHomeScreen from '../screens/patient/PatientHomeScreen';
import MedicationsScreen from '../screens/patient/MedicationsScreen';
import IntakesScreen from '../screens/patient/IntakesScreen';
import ProfileScreen from '../screens/patient/ProfileScreen';
import Footer from '../components/Footer';

const screens = [
  { name: 'Accueil', component: PatientHomeScreen, icon: 'home' },
  { name: 'Médicaments', component: MedicationsScreen, icon: 'medication' },
  { name: 'Prises', component: IntakesScreen, icon: 'check-circle' },
  { name: 'Profil', component: ProfileScreen, icon: 'person' },
];

const PatientNavigator = () => {
  return <Footer screens={screens} />;
};

export default PatientNavigator;