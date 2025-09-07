import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../../components/Header';
import { getDoctorStats } from '../../api/doctor';
import { logout } from '../../utils/auth';

const DoctorHomeScreen = ({ navigation }) => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    getDoctorStats()
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title="PillPall"
        onLogout={() => {
          logout();
          navigation.replace('Login');
        }}
        onHistory={() => navigation.navigate('Historique')}
        showMenu
      />
      <View style={styles.content}>
        <Text style={styles.heading}>Tableau de bord</Text>
        <Text>Total Patients: {stats.totalPatients || 0}</Text>
        <Text>Prescriptions ce mois: {stats.monthlyPrescriptions || 0}</Text>
        <Text>
          Taux d'observance moyen:{' '}
          {stats.averageAdherence
            ? (stats.averageAdherence * 100).toFixed(2)
            : 0}
          %
        </Text>
        <Text>Alertes actives: {stats.activeAlerts || 0}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 16,
  },
});

export default DoctorHomeScreen;
