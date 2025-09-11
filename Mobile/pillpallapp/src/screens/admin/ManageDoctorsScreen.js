import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Header from '../../components/Header';
import DoctorCard from '../../components/DoctorCard';
import { getDoctors, updateDoctor, deleteDoctor, getSpecialties } from '../../api/admin';
import { logout } from '../../utils/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ManageDoctorsScreen = ({ navigation }) => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', specialty: null });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, specialtiesRes] = await Promise.all([
          getDoctors(),
          getSpecialties(),
        ]);
        console.log('Doctors data:', doctorsRes.data); // Debug
        console.log('Specialties data:', specialtiesRes.data); // Debug
        setDoctors(doctorsRes.data || []);
        setSpecialties(specialtiesRes.data || []);
        setError(null);
      } catch (error) {
        console.error('Fetch error:', error.message); // Debug
        setError(error.message);
        Alert.alert('Erreur', error.message);
      }
    };
    fetchData();
  }, []);

  const filteredDoctors = doctors.filter(
    (d) =>
      (!selectedSpecialty || d.specialty?.id === selectedSpecialty) &&
      (d.fullName.toLowerCase().includes(search.toLowerCase()) || d.email.toLowerCase().includes(search.toLowerCase()))
  );

  

  const handleSubmit = async () => {
    if (!form.fullName || !form.email || !form.specialty) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    try {
      if (editingId) {
        await updateDoctor(editingId, {
          fullName: form.fullName,
          email: form.email,
          specialty: form.specialty,
        });
        setDoctors(
          doctors.map((d) =>
            d.id === editingId ? { ...d, fullName: form.fullName, email: form.email, specialty: form.specialty } : d
          )
        );
        Alert.alert('Succès', 'Médecin mis à jour');
        setForm({ fullName: '', email: '', specialty: null });
        setEditingId(null);
        setError(null);
      }
    } catch (error) {
      console.error('Submit error:', error.message); // Debug
      setError(error.message);
      Alert.alert('Erreur', error.message);
    }
  };

  

  return (
    <View style={styles.container}>
      <Header
        title="Gestion des médecins"
        onLogout={() => {
          logout();
          navigation.replace('Login');
        }}
      />
      <View style={styles.content}>
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        <View style={styles.filterContainer}>
          <Picker
            selectedValue={selectedSpecialty}
            style={styles.picker}
            onValueChange={(value) => setSelectedSpecialty(value)}
          >
            <Picker.Item label="Toutes spécialités" value="" />
            {specialties.map((s) => (
              <Picker.Item key={s.id?.toString() || Math.random().toString()} label={s.name} value={s.id} />
            ))}
          </Picker>
          <View style={styles.searchContainer}>
                      <Icon name="search" size={20} color="#1E40AF" style={styles.searchIcon} />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Chercher doctor par nom ou email"
                        placeholderTextColor="#666666"
                        value={search}
                        onChangeText={setSearch}
                      />
                    </View>
        </View>

        {editingId && (
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
            <Picker
              selectedValue={form.specialty?.id}
              style={styles.picker}
              onValueChange={(value) =>
                setForm({ ...form, specialty: specialties.find((s) => s.id === value) || null })
              }
            >
              <Picker.Item label="Choisir spécialité" value={null} />
              {specialties.map((s) => (
                <Picker.Item key={s.id?.toString() || Math.random().toString()} label={s.name} value={s.id} />
              ))}
            </Picker>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Icon name="save" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Modifier</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={filteredDoctors}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => (
            <DoctorCard
              doctor={item}
              onEdit={(d) => {
                setEditingId(d.id);
                setForm({ fullName: d.fullName, email: d.email, specialty: d.specialty });
              }}
              
            />
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Aucun médecin trouvé</Text>}
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
    flex: 1,
    padding: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#1E40AF',
    borderRadius: 8,
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#1E40AF',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  form: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F0F4F8',
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1E40AF',
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 20,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 16,
  },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#1E40AF', borderRadius: 8 },
  searchIcon: { marginLeft: 8 },
  searchInput: { flex: 1, padding: 10, fontSize: 16 },
});

export default ManageDoctorsScreen;