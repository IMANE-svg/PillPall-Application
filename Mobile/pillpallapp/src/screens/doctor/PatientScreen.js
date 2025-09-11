import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/Header';
import PatientCard from '../../components/PatientCard';
import { getPatients } from '../../api/doctor';
import { logout } from '../../utils/auth';

const PatientsScreen = ({ navigation }) => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getPatients()
      .then((res) => {
        const sorted = res.data.sort((a, b) => a.fullName.localeCompare(b.fullName));
        setPatients(sorted);
      })
      .catch(() => {
        Alert.alert('Erreur', 'Impossible de charger les patients');
      });
  }, []);

  const filteredPatients = patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
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
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#666666" style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Rechercher par nom ou email"
            placeholderTextColor="#666666"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        {filteredPatients.length === 0 && (
          <Text style={styles.noData}>Aucun patient trouvé</Text>
        )}
        <FlatList
          data={filteredPatients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PatientCard
              patient={item}
              onPress={() => navigation.navigate('Prescriptions', { patientId: item.id })}
            />
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E40AF',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: '#F8F8F8',
  },
  searchIcon: { marginRight: 8 },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: '#000000',
  },
  noData: {
    textAlign: 'center',
    color: '#666666',
    marginVertical: 16,
  },
});

export default PatientsScreen;