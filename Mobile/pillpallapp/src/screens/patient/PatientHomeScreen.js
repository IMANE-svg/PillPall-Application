import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../../components/Header';
import { getPatientDashboard } from '../../api/patient';
import { logout } from '../../utils/auth';

const PatientHomeScreen = ({ navigation }) => {
  const [dashboard, setDashboard] = useState({});

  useEffect(() => {
    getPatientDashboard().then((res) => setDashboard(res.data)).catch(() => {});
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
        <Text>Doses prises: {dashboard.dosesTaken || 0}</Text>
        <Text>Doses manquées: {dashboard.dosesMissed || 0}</Text>
        <Text>Taux d'observance: {(dashboard.adherenceRate * 100).toFixed(2)}%</Text>
        <Text>Prochaines prises: {dashboard.upcoming?.length || 0}</Text>

        {dashboard.recommendations && (
          <View style={styles.recommendations}>
            <Text style={styles.recommendTitle}>Recommandations</Text>
            {dashboard.recommendations.map((rec, i) => (
              <Text key={i}>{rec}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1E40AF', marginBottom: 12 },
  recommendations: { marginTop: 16 },
  recommendTitle: { fontWeight: 'bold', marginBottom: 6 },
});

export default PatientHomeScreen;
