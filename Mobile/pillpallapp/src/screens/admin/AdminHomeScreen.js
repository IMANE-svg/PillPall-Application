import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../../components/Header';
import { getAdminStats } from '../../api/admin';
import { logout } from '../../utils/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AdminHomeScreen = ({ navigation }) => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res.data))
      .catch(() => Alert.alert('Erreur', 'Impossible de charger les statistiques'));
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
        <View style={styles.card}>
          <Icon name="local-hospital" size={30} color="#1E40AF" style={styles.cardIcon} />
          <Text style={styles.cardText}>Médecins: {stats.totalDoctors || 0}</Text>
        </View>
        <View style={styles.card}>
          <Icon name="people" size={30} color="#1E40AF" style={styles.cardIcon} />
          <Text style={styles.cardText}>Patients: {stats.totalPatients || 0}</Text>
        </View>
        <View style={styles.card}>
          <Icon name="person" size={30} color="#1E40AF" style={styles.cardIcon} />
          <Text style={styles.cardText}>Utilisateurs: {stats.totalUsers || 0}</Text>
        </View>
        <View style={styles.card}>
          <Icon name="check-circle" size={30} color="#1E40AF" style={styles.cardIcon} />
          <Text style={styles.cardText}>Actifs: {stats.activeUsers || 0}</Text>
        </View>
        <View style={styles.card}>
          <Icon name="category" size={30} color="#1E40AF" style={styles.cardIcon} />
          <Text style={styles.cardText}>Spécialités: {stats.totalSpecialties || 0}</Text>
        </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F0F4F8',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    marginRight: 12,
  },
  cardText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
});

export default AdminHomeScreen;