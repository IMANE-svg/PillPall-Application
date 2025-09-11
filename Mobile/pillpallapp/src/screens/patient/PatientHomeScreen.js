import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/Header';
import { getPatientDashboard } from '../../api/patient';
import { logout } from '../../utils/auth';
import moment from 'moment';

const PatientHomeScreen = ({ navigation }) => {
  const [dashboard, setDashboard] = useState({
    stats: {},
    upcomingMedications: [],
    recommendations: [],
    activePrescriptions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPatientDashboard()
      .then((res) => {
        console.log('Réponse dashboard:', JSON.stringify(res.data, null, 2));
        const sortedUpcoming = (res.data.upcomingMedications || []).sort((a, b) =>
          new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
        );
        setDashboard({ ...res.data, upcomingMedications: sortedUpcoming });
      })
      .catch((err) => {
        console.error('Erreur dashboard:', err.response?.data || err.message);
        Alert.alert('Erreur', 'Impossible de charger le tableau de bord');
      })
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (isoDate) => {
    return isoDate ? moment(isoDate).format('HH:mm') : 'N/A';
  };

  const adherenceRate = Math.min(100, ((dashboard.stats.adherenceRateLastWeek || 0) * 100)).toFixed(2);

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="PillPall" onLogout={() => { logout(); navigation.replace('Login'); }} />
        <ActivityIndicator size="large" color="#1E40AF" style={styles.loader} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="PillPall" onLogout={() => { logout(); navigation.replace('Login'); }} />
      <View style={styles.content}>
        <Text style={styles.title}>Tableau de bord</Text>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="folder" size={24} color="#1E40AF" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Prescriptions actives</Text>
          </View>
          <Text style={styles.cardText}>
            {(dashboard.activePrescriptions?.length || dashboard.stats.activePrescriptions || 0)}
          </Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="check-circle" size={24} color="#22C55E" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Doses prises (semaine dernière)</Text>
          </View>
          <Text style={styles.cardText}>{dashboard.stats.takenDosesLastWeek || 0}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="cancel" size={24} color="#DC2626" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Doses manquées (semaine dernière)</Text>
          </View>
          <Text style={styles.cardText}>{dashboard.stats.missedDosesLastWeek || 0}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="percent" size={24} color="#1E40AF" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Taux d'observance</Text>
          </View>
          <Text style={styles.cardText}>{adherenceRate}%</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="access-time" size={24} color="#1E40AF" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Prochaine prise</Text>
          </View>
          {dashboard.upcomingMedications?.length > 0 ? (
            <View style={styles.upcomingItem}>
              <Text style={styles.upcomingText}>
                {dashboard.upcomingMedications[0].medication || 'N/A'} ({dashboard.upcomingMedications[0].dosage || 'N/A'})
              </Text>
              <Text style={styles.upcomingText}>
                Horaire : {formatTime(dashboard.upcomingMedications[0].scheduledTime)}
              </Text>
              <Text style={styles.upcomingText}>
                Prescrit par : {dashboard.upcomingMedications[0].prescribedBy || 'N/A'}
              </Text>
            </View>
          ) : (
            <Text style={styles.cardText}>Aucune prise à venir</Text>
          )}
        </View>
        {dashboard.recommendations?.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="lightbulb" size={24} color="#F59E0B" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Recommandations</Text>
            </View>
            <FlatList
              data={dashboard.recommendations}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Text style={styles.recommendation}>{item}</Text>
              )}
              ListEmptyComponent={<Text style={styles.cardText}>Aucune recommandation</Text>}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  loader: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1E40AF', marginBottom: 12 },
  card: { backgroundColor: '#F3F4F6', borderRadius: 8, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardIcon: { marginRight: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E40AF' },
  cardText: { fontSize: 14, color: '#6B7280' },
  upcomingItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  upcomingText: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  recommendation: { fontSize: 14, color: '#6B7280', marginVertical: 4 },
});

export default PatientHomeScreen;