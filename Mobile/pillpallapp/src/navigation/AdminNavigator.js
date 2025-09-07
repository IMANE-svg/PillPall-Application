import React from 'react';
import Footer from '../components/Footer';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import ManageDoctorsScreen from '../screens/admin/ManageDoctorsScreen';
import ManagePatientsScreen from '../screens/admin/ManagePatientScreen';
import ManageSpecialtiesScreen from '../screens/admin/ManageSpecialtiesScreen';
import ManageRightsScreen from '../screens/admin/ManageRightsScreen';

const screens = [
  { name: 'Accueil', component: AdminHomeScreen, icon: 'home' },
  { name: 'Médecins', component: ManageDoctorsScreen, icon: 'people' },
  { name: 'Patients', component: ManagePatientsScreen, icon: 'group' },
  { name: 'Spécialités', component: ManageSpecialtiesScreen, icon: 'category' },
  { name: 'Droits', component: ManageRightsScreen, icon: 'security' },
];

const AdminNavigator = () => {
  return <Footer screens={screens} role="admin" />;
};

export default AdminNavigator;