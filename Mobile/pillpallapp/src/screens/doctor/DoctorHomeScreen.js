import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/Header';
import { getDoctorStats } from '../../api/doctor';
import { logout } from '../../utils/auth';

const DoctorHomeScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    monthlyPrescriptions: 0,
    averageAdherence: 0,
    activeAlerts: 0,
  });

  useEffect(() => {
    getDoctorStats()
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
        onHistory={() => navigation.navigate('Historique')}
        showMenu
      />
      <View style={styles.content}>
        <Text style={styles.heading}>Tableau de bord</Text>
        <View style={styles.card}>
          <Icon name="people" size={30} color="#1E40AF" style={styles.cardIcon} />
          <View>
            <Text style={styles.cardTitle}>Patients</Text>
            <Text style={styles.cardValue}>{stats.totalPatients || 0}</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Icon name="description" size={30} color="#1E40AF" style={styles.cardIcon} />
          <View>
            <Text style={styles.cardTitle}>Prescriptions ce mois</Text>
            <Text style={styles.cardValue}>{stats.monthlyPrescriptions || 0}</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Icon name="check-circle" size={30} color="#1E40AF" style={styles.cardIcon} />
          <View>
            <Text style={styles.cardTitle}>Taux d'observance</Text>
            <Text style={styles.cardValue}>{(stats.averageAdherence * 100).toFixed(2)}%</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Icon name="warning" size={30} color="#EF4444" style={styles.cardIcon} />
          <View>
            <Text style={styles.cardTitle}>Alertes actives</Text>
            <Text style={styles.cardValue}>{stats.activeAlerts || 0}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate('Patients')}
        >
          <Text style={styles.buttonText}>Voir les patients</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: { marginRight: 16 },
  cardTitle: { fontSize: 16, color: '#1E40AF', fontWeight: '600' },
  cardValue: { fontSize: 24, color: '#333333', fontWeight: 'bold' },
  floatingButton: {
    backgroundColor: '#1E40AF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  buttonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
});

export default DoctorHomeScreen;