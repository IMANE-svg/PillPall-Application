import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet } from 'react-native';
import Header from '../../components/Header';
import { getMedications } from '../../api/patient';
import { logout } from '../../utils/auth';

const MedicationsScreen = ({ navigation }) => {
  const [medications, setMedications] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getMedications().then((res) => setMedications(res.data)).catch(() => {});
  }, []);

  const filteredMedications = medications.filter((m) =>
    m.medicationName.toLowerCase().includes(search.toLowerCase())
  );

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
            <View style={styles.medicationRow}>
              <Text>Médicament: {item.medicationName}</Text>
              <Text>Médecin: {item.doctor.user.fullName} ({item.doctor.specialty?.name})</Text>
              <Text>Dosage: {item.dosage}</Text>
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
  input: { borderWidth: 1, borderColor: '#1E40AF', padding: 10, marginBottom: 12, borderRadius: 6, color: '#000000' },
  medicationRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#ccc' },
});

export default MedicationsScreen;
