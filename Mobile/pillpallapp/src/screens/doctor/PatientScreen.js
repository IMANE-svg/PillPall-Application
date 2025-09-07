import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, StyleSheet } from 'react-native';
import Header from '../../components/Header';
import PatientCard from '../../components/PatientCard';
import { getPatients } from '../../api/doctor';
import { logout } from '../../utils/auth';

const PatientsScreen = ({ navigation }) => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getPatients().then((res) => {
      const sorted = res.data.sort((a, b) => a.user.fullName.localeCompare(b.user.fullName));
      setPatients(sorted);
    }).catch(() => {});
  }, []);

  const filteredPatients = patients.filter((p) =>
    p.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.user.email.toLowerCase().includes(search.toLowerCase())
  );

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
          placeholder="Rechercher par nom ou email"
          placeholderTextColor="#666666"
          value={search}
          onChangeText={setSearch}
        />
        <FlatList
          data={filteredPatients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <PatientCard patient={item} />}
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
});

export default PatientsScreen;
