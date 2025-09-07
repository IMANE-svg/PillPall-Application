import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Header from '../../components/Header';
import PatientCard from '../../components/PatientCard';
import { getDoctors, getPatientsByDoctor, updatePatient } from '../../api/admin';
import { logout } from '../../utils/auth';

const ManagePatientsScreen = ({ navigation }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', birthDate: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    getDoctors().then((res) => setDoctors(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedDoctorId) {
      getPatientsByDoctor(selectedDoctorId)
        .then((res) => {
          const sorted = res.data.sort((a, b) => a.user.fullName.localeCompare(b.user.fullName));
          setPatients(sorted);
        })
        .catch(() => {});
    }
  }, [selectedDoctorId]);

  const filteredPatients = patients.filter((p) =>
    p.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdate = async () => {
    try {
      await updatePatient(editingId, form);
      setPatients(patients.map((p) => (p.id === editingId ? { ...p, user: { ...p.user, ...form } } : p)));
      setForm({ fullName: '', email: '', birthDate: '' });
      setEditingId(null);
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la mise à jour');
    }
  };

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
        <Picker
          selectedValue={selectedDoctorId}
          style={styles.picker}
          onValueChange={(value) => setSelectedDoctorId(value)}
        >
          <Picker.Item label="Choisir un médecin" value="" />
          {doctors.map((d) => (
            <Picker.Item key={d.id} label={d.user.fullName} value={d.id} />
          ))}
        </Picker>

        <TextInput
          style={styles.input}
          placeholder="Rechercher par nom ou email"
          value={search}
          onChangeText={setSearch}
        />

        {editingId && (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Nom complet"
              value={form.fullName}
              onChangeText={(text) => setForm({ ...form, fullName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Date de naissance (YYYY-MM-DD)"
              value={form.birthDate}
              onChangeText={(text) => setForm({ ...form, birthDate: text })}
            />
            <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
              <Text style={styles.buttonText}>Mettre à jour</Text>
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
                setForm({ fullName: p.user.fullName, email: p.user.email, birthDate: p.birthDate });
              }}
            />
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1E40AF',
    padding: 8,
    marginBottom: 16,
    borderRadius: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#1E40AF',
    marginBottom: 16,
    borderRadius: 8,
  },
  updateButton: {
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ManagePatientsScreen;
