import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../../components/Header';
import { getAdminStats } from '../../api/admin';
import { logout } from '../../utils/auth';

const AdminHomeScreen = ({ navigation }) => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    getAdminStats().then((res) => setStats(res.data)).catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title="PillPall"
        onLogout={() => {
          logout();
          navigation.replace('Login');
        }}
      />
      <View style={styles.content}>
        <Text style={styles.title}>Tableau de bord</Text>
        <Text>Total médecins: {stats.totalDoctors || 0}</Text>
        <Text>Total patients: {stats.totalPatients || 0}</Text>
        <Text>Utilisateurs actifs: {stats.activeUsers || 0}</Text>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 16,
  },
});

export default AdminHomeScreen;
