import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import Header from '../../components/Header';
import ContactCard from '../../components/ContactCard';
import DoctorCard from '../../components/DoctorCard';
import { getProfile, updateProfile, getContacts, addContact, updateContact, deleteContact, addDoctor, removeDoctor, getDoctors } from '../../api/patient';
import { logout } from '../../utils/auth';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState({});
  const [contacts, setContacts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ fullName: '', email: '', birthDate: '' });
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '' });
  const [editingContactId, setEditingContactId] = useState(null);
  const [addingContact, setAddingContact] = useState(false);
  const [addingDoctor, setAddingDoctor] = useState(false);

  useEffect(() => {
    getProfile().then((res) => setProfile(res.data)).catch(() => {});
    getContacts().then((res) => setContacts(res.data)).catch(() => {});
    getDoctors().then((res) => setDoctors(res.data)).catch(() => {});
  }, []);

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(form);
      setProfile({ ...profile, ...form });
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la mise à jour');
    }
  };

  const handleAddContact = async () => {
    try {
      if (editingContactId) {
        await updateContact(editingContactId, contactForm);
        setContacts(contacts.map((c) => (c.id === editingContactId ? { ...c, ...contactForm } : c)));
      } else {
        const res = await addContact(contactForm);
        setContacts([...contacts, { id: res.data, ...contactForm }]);
      }
      setContactForm({ name: '', email: '', phone: '' });
      setEditingContactId(null);
      setAddingContact(false);
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l’opération');
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      await deleteContact(id);
      setContacts(contacts.filter((c) => c.id !== id));
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la suppression');
    }
  };

  const handleAddDoctor = async (doctorId) => {
    try {
      await addDoctor(doctorId);
      const newDoctor = doctors.find((d) => d.id === doctorId);
      setProfile({ ...profile, doctors: [...(profile.doctors || []), newDoctor] });
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l’ajout');
    }
  };

  const handleRemoveDoctor = async (doctorId) => {
    try {
      await removeDoctor(doctorId);
      setProfile({ ...profile, doctors: profile.doctors.filter((d) => d.id !== doctorId) });
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la suppression');
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
        <Text style={styles.sectionTitle}>Profil</Text>
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
        <TouchableOpacity style={styles.buttonBlue} onPress={handleUpdateProfile}>
          <Text style={styles.buttonText}>Mettre à jour</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Mes contacts</Text>
        {addingContact ? (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Nom"
              placeholderTextColor="#666666"
              value={contactForm.name}
              onChangeText={(text) => setContactForm({ ...contactForm, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666666"
              value={contactForm.email}
              onChangeText={(text) => setContactForm({ ...contactForm, email: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Téléphone"
              placeholderTextColor="#666666"
              value={contactForm.phone}
              onChangeText={(text) => setContactForm({ ...contactForm, phone: text })}
            />
            <TouchableOpacity style={styles.buttonGreen} onPress={handleAddContact}>
              <Text style={styles.buttonText}>{editingContactId ? 'Modifier' : 'Ajouter'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={contacts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ContactCard
                contact={item}
                onEdit={(c) => {
                  setEditingContactId(c.id);
                  setContactForm({ name: c.name, email: c.email, phone: c.phone });
                  setAddingContact(true);
                }}
                onDelete={handleDeleteContact}
              />
            )}
          />
        )}
        <TouchableOpacity style={styles.buttonBlue} onPress={() => setAddingContact(true)}>
          <Text style={styles.buttonText}>Ajouter contact</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Mes médecins</Text>
        {addingDoctor ? (
          <View>
            <FlatList
              data={doctors}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <DoctorCard doctor={item} onAdd={handleAddDoctor} />
              )}
            />
            <TouchableOpacity style={styles.buttonBlue} onPress={() => setAddingDoctor(false)}>
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={profile.doctors || []}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <DoctorCard doctor={item} onDelete={handleRemoveDoctor} />
            )}
          />
        )}
        <TouchableOpacity style={styles.buttonBlue} onPress={() => setAddingDoctor(true)}>
          <Text style={styles.buttonText}>Ajouter médecin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E40AF', marginVertical: 12 },
  input: { borderWidth: 1, borderColor: '#1E40AF', padding: 10, marginBottom: 12, borderRadius: 6, color: '#000000' },
  buttonBlue: { backgroundColor: '#1E40AF', padding: 12, borderRadius: 6, alignItems: 'center', marginVertical: 6 },
  buttonGreen: { backgroundColor: '#22C55E', padding: 12, borderRadius: 6, alignItems: 'center', marginVertical: 6 },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold' },
});

export default ProfileScreen;
