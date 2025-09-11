import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import Header from '../../components/Header';
import { getMedications } from '../../api/patient';
import { logout } from '../../utils/auth';

const MedicationsScreen = ({ navigation }) => {
  const [medications, setMedications] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMedications = () => {
    setRefreshing(true);
    getMedications()
      .then((res) => {
        console.log('Réponse médicaments:', res.data);
        setMedications(res.data || []);
      })
      .catch((err) => console.log('Erreur médicaments:', err))
      .finally(() => {
        setRefreshing(false);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const filteredMedications = medications.filter((m) =>
    m.medication?.toLowerCase().includes(search.toLowerCase())
  );

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
        <TextInput
          style={styles.input}
          placeholder="Rechercher médicament"
          placeholderTextColor="#666666"
          value={search}
          onChangeText={setSearch}
        />
        <FlatList
          data={filteredMedications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.medicationCard}>
              <Text style={styles.medicationText}>Médicament : {item.medication || 'N/A'}</Text>
              <Text style={styles.medicationText}>Médecin : {item.doctorName || 'N/A'} ({item.specialty?.name || 'Non spécifié'})</Text>
              <Text style={styles.medicationText}>Dosage : {item.dosage || 'Non spécifié'}</Text>
              <Text style={styles.medicationText}>Du {item.startDate || 'N/A'} au {item.endDate || 'N/A'}</Text>
            </View>
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchMedications} />}
          ListEmptyComponent={<Text style={styles.emptyText}>Aucun médicament trouvé</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  loader: { flex: 1, justifyContent: 'center' },
  input: { borderWidth: 1, borderColor: '#1E40AF', padding: 10, marginBottom: 12, borderRadius: 6, color: '#000000' },
  medicationCard: { backgroundColor: '#F3F4F6', borderRadius: 8, padding: 12, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  medicationText: { color: '#6B7280', marginBottom: 4 },
  emptyText: { color: '#6B7280', textAlign: 'center', marginVertical: 12 },
});

export default MedicationsScreen;