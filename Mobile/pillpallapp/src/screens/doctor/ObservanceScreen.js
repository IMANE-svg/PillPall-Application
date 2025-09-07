import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet } from 'react-native';
import Header from '../../components/Header';
import { getObservance } from '../../api/doctor';
import { logout } from '../../utils/auth';

const ObservanceScreen = ({ navigation }) => {
  const [patientId, setPatientId] = useState('');
  const [observance, setObservance] = useState([]);

  useEffect(() => {
    if (patientId) {
      getObservance(patientId).then((res) => setObservance(res.data)).catch(() => {});
    }
  }, [patientId]);

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
        <TextInput
          style={styles.input}
          placeholder="ID Patient"
          placeholderTextColor="#666666"
          value={patientId}
          onChangeText={setPatientId}
          keyboardType="numeric"
        />
        <FlatList
          data={observance}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text>Medicament: {item.prescription.medicationName}</Text>
              <Text>Horaire: {item.scheduledAt}</Text>
              <Text>Statut: {item.status}</Text>
              <Text>Confirmé à: {item.confirmedAt || 'Non confirmé'}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#1E40AF',
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
    fontSize: 16,
    color: '#000000',
  },
  item: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
});

export default ObservanceScreen;
