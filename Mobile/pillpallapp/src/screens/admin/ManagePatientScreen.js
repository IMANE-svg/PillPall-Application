import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import Header from '../../components/Header';
import PatientCard from '../../components/PatientCard';
import { getPatients, updatePatient, deleteUser } from '../../api/admin';
import { logout } from '../../utils/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ManagePatientsScreen = ({ navigation }) => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', birthDate: '' });
  const [editingId, setEditingId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPatients()
      .then((res) => {
        console.log('Patients loaded:', res.data); // Debug
        setPatients(res.data.sort((a, b) => a.fullName.localeCompare(b.fullName)) || []);
        setError(null);
      })
      .catch((err) => {
        const msg = err.message;
        setError(msg);
        Alert.alert('Erreur', 'Impossible de charger les patients: ' + msg);
      });
  }, []);

  const filteredPatients = patients.filter(
    (p) => p.fullName.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!form.fullName || !form.email || !form.birthDate) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    try {
      if (editingId) {
        await updatePatient(editingId, {
          fullName: form.fullName,
          email: form.email,
          birthDate: form.birthDate,
        });
        setPatients(
          patients.map((p) =>
            p.id === editingId ? { ...p, fullName: form.fullName, email: form.email, birthDate: form.birthDate } : p
          )
        );
        Alert.alert('Succès', 'Patient mis à jour');
      } else {
        Alert.alert('Info', 'Ajout de patient non supporté par le backend');
      }
      setForm({ fullName: '', email: '', birthDate: '' });
      setEditingId(null);
      setAdding(false);
      setError(null);
    } catch (error) {
      const msg = error.message;
      setError(msg);
      Alert.alert('Erreur', 'Échec de l’opération: ' + msg);
    }
  };

  

  return (
    <View style={styles.container}>
      <Header title="Gestion des patients" onLogout={() => { logout(); navigation.replace('Login'); }} />
      <View style={styles.content}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#1E40AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Chercher patient"
            placeholderTextColor="#666666"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {(adding || editingId) && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nom complet"
              placeholderTextColor="#666666"
              value={form.fullName}
              onChangeText={(text) => setForm({ ...form, fullName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666666"
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Date de naissance (YYYY-MM-DD)"
              placeholderTextColor="#666666"
              value={form.birthDate}
              onChangeText={(text) => setForm({ ...form, birthDate: text })}
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Icon name="save" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>{editingId ? 'Modifier' : 'Ajouter'}</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={filteredPatients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PatientCard
              patient={item}
              onEdit={(p) => {
                setEditingId(p.id);
                setAdding(false);
                setForm({ fullName: p.fullName, email: p.email, birthDate: p.birthDate });
              }}
              
            />
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Aucun patient trouvé</Text>}
        />

        {!adding && !editingId && (
          <TouchableOpacity style={styles.addButton} onPress={() => { setAdding(true); setEditingId(null); setForm({ fullName: '', email: '', birthDate: '' }); }}>
            <Icon name="add" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Ajouter un patient</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#1E40AF', borderRadius: 8, marginBottom: 16 },
  searchIcon: { marginLeft: 8 },
  searchInput: { flex: 1, padding: 10, fontSize: 16 },
  form: { marginBottom: 16, padding: 12, backgroundColor: '#F0F4F8', borderRadius: 8 },
  input: { borderWidth: 1, borderColor: '#1E40AF', padding: 10, marginBottom: 12, borderRadius: 8, fontSize: 16 },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10B981', padding: 12, borderRadius: 8 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E40AF', padding: 12, borderRadius: 8, marginTop: 16 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  buttonIcon: { marginRight: 8 },
  errorText: { color: '#EF4444', textAlign: 'center', fontSize: 16, marginBottom: 16 },
  emptyText: { textAlign: 'center', color: '#6B7280', fontSize: 16, marginTop: 20 },
});

export default ManagePatientsScreen;