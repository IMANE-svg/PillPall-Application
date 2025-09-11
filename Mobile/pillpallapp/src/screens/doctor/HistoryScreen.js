import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import Header from '../../components/Header';
import { getHistory } from '../../api/doctor';
import { logout } from '../../utils/auth';

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getHistory()
      .then((res) => setHistory(res.data))
      .catch(() => Alert.alert('Erreur', 'Impossible de charger l’historique'));
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title="PillPall"
        onLogout={() => {
          logout();
          navigation.replace('Login');
        }}
        onHistory={() => {}}
        showMenu
      />
      <View style={styles.content}>
        <Text style={styles.title}>Historique des prescriptions</Text>
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>Patient: {item.patientFullName}</Text>
              <Text style={styles.detail}>Médicament: {item.medicationName}</Text>
              <Text style={styles.detail}>Dosage: {item.dosage}</Text>
              <Text style={styles.detail}>Début: {item.startDate}</Text>
              <Text style={styles.detail}>Fin: {item.endDate}</Text>
              <Text style={styles.detail}>Créé le: {item.createdAt}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1E40AF', marginBottom: 16 },
  card: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    backgroundColor: '#F8F8F8',
    borderRadius: 6,
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  detail: {
    fontSize: 14,
    color: '#333333',
  },
});

export default HistoryScreen;