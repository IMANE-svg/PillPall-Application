import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Header from '../../components/Header';
import DoctorCard from '../../components/DoctorCard';
import { getDoctors, updateDoctor, getSpecialties } from '../../api/admin';
import { logout } from '../../utils/auth';

const ManageDoctorsScreen = ({ navigation }) => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', specialty: null });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    getDoctors().then((res) => setDoctors(res.data)).catch(() => {});
    getSpecialties().then((res) => setSpecialties(res.data)).catch(() => {});
  }, []);

  const filteredDoctors = doctors.filter((d) =>
    (!selectedSpecialty || d.specialty?.id === selectedSpecialty) &&
    (d.user.fullName.toLowerCase().includes(search.toLowerCase()) || d.user.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleUpdate = async () => {
    try {
      await updateDoctor(editingId, form);
      setDoctors(doctors.map((d) => (d.id === editingId ? { ...d, user: { ...d.user, ...form }, specialty: form.specialty } : d)));
      setForm({ fullName: '', email: '', specialty: null });
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
          selectedValue={selectedSpecialty}
          style={styles.picker}
          onValueChange={(value) => setSelectedSpecialty(value)}
        >
          <Picker.Item label="Toutes spécialités" value="" />
          {specialties.map((s) => (
            <Picker.Item key={s.id} label={s.name} value={s.id} />
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
            <Picker
              selectedValue={form.specialty?.id}
              style={styles.picker}
              onValueChange={(value) => setForm({ ...form, specialty: specialties.find((s) => s.id === value) })}
            >
              {specialties.map((s) => (
                <Picker.Item key={s.id} label={s.name} value={s.id} />
              ))}
            </Picker>
            <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
              <Text style={styles.buttonText}>Mettre à jour</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={filteredDoctors}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <DoctorCard
              doctor={item}
              onEdit={(d) => {
                setEditingId(d.id);
                setForm({ fullName: d.user.fullName, email: d.user.email, specialty: d.specialty });
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

export default ManageDoctorsScreen;
