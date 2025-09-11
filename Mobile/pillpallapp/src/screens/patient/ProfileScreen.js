import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/Header';
import ContactCard from '../../components/ContactCard';
import DoctorCard from '../../components/DoctorCard';
import { getProfile, updateProfile, getContacts, addContact, updateContact, deleteContact, addDoctor, removeDoctor, getPublicDoctors, getPatientDoctors } from '../../api/patient';
import { logout } from '../../utils/auth';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState({});
  const [contacts, setContacts] = useState([]);
  const [publicDoctors, setPublicDoctors] = useState([]);
  const [patientDoctors, setPatientDoctors] = useState([]);
  const [form, setForm] = useState({ fullName: '', email: '', birthDate: '' });
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '' });
  const [editingContactId, setEditingContactId] = useState(null);
  const [addingContact, setAddingContact] = useState(false);
  const [addingDoctor, setAddingDoctor] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [openSection, setOpenSection] = useState(null); // Gère la section ouverte

  useEffect(() => {
    getProfile()
      .then((res) => {
        console.log('Réponse profil:', res.data);
        setProfile(res.data);
        setForm({
          fullName: res.data.fullName || '',
          email: res.data.email || '',
          birthDate: res.data.birthDate || '',
        });
      })
      .catch((err) => {
        console.error('Erreur profil:', err);
        Alert.alert('Erreur', err.response?.data || 'Impossible de charger le profil');
      });
    getContacts()
      .then((res) => {
        console.log('Réponse contacts:', res.data);
        setContacts(res.data);
      })
      .catch((err) => {
        console.error('Erreur contacts:', err);
        Alert.alert('Erreur', err.response?.data || 'Impossible de charger les contacts');
      });
    getPublicDoctors()
      .then((res) => {
        console.log('Réponse médecins publics:', res.data);
        setPublicDoctors(res.data);
      })
      .catch((err) => {
        console.error('Erreur médecins publics:', err);
        Alert.alert('Erreur', err.response?.data || 'Impossible de charger les médecins');
      });
    getPatientDoctors()
      .then((res) => {
        console.log('Réponse médecins patient:', res.data);
        setPatientDoctors(res.data);
      })
      .catch((err) => {
        console.error('Erreur médecins patient:', err);
        Alert.alert('Erreur', err.response?.data || 'Impossible de charger les médecins associés');
      });
  }, []);

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(form);
      setProfile({ ...profile, ...form });
      Alert.alert('Succès', 'Profil mis à jour');
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      Alert.alert('Erreur', error.response?.data || 'Échec de la mise à jour');
    }
  };

  const handleAddContact = async () => {
    if (!contactForm.name.trim()) {
      Alert.alert('Erreur', 'Le nom du contact est requis');
      return;
    }
    try {
      let newContact;
      if (editingContactId) {
        await updateContact(editingContactId, contactForm);
        newContact = { id: editingContactId, ...contactForm };
        setContacts(contacts.map((c) => (c.id === editingContactId ? newContact : c)));
        Alert.alert('Succès', 'Contact modifié');
      } else {
        const res = await addContact(contactForm);
        newContact = { id: res.data, ...contactForm };
        setContacts([...contacts, newContact]);
        Alert.alert('Succès', 'Contact ajouté');
      }
      setContactForm({ name: '', email: '', phone: '' });
      setEditingContactId(null);
      setAddingContact(false);
    } catch (error) {
      console.error('Erreur ajout/modification contact:', error);
      Alert.alert('Erreur', error.response?.data || 'Échec de l’opération');
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      await deleteContact(id);
      setContacts(contacts.filter((c) => c.id !== id));
      Alert.alert('Succès', 'Contact supprimé');
    } catch (error) {
      console.error('Erreur suppression contact:', error);
      Alert.alert('Erreur', error.response?.data || 'Échec de la suppression');
    }
  };

  const handleAddDoctor = async () => {
    if (!selectedDoctorId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un médecin');
      return;
    }
    try {
      await addDoctor(selectedDoctorId);
      const newDoctor = publicDoctors.find((d) => d.id === selectedDoctorId);
      setPatientDoctors([...patientDoctors, newDoctor]);
      setAddingDoctor(false);
      setSelectedDoctorId(null);
      Alert.alert('Succès', 'Médecin ajouté');
    } catch (error) {
      console.error('Erreur ajout médecin:', error);
      Alert.alert('Erreur', error.response?.data || 'Échec de l’ajout');
    }
  };

  const handleRemoveDoctor = async (doctorId) => {
    try {
      await removeDoctor(doctorId);
      setPatientDoctors(patientDoctors.filter((d) => d.id !== doctorId));
      Alert.alert('Succès', 'Médecin supprimé');
    } catch (error) {
      console.error('Erreur suppression médecin:', error);
      Alert.alert('Erreur', error.response?.data || 'Échec de la suppression');
    }
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
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
        {/* Carte Informations personnelles */}
        <TouchableOpacity style={styles.card} onPress={() => toggleSection('profile')}>
          <View style={styles.cardHeader}>
            <Icon name="person" size={24} color="#1E40AF" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Informations personnelles</Text>
            <Icon
              name={openSection === 'profile' ? 'expand-less' : 'expand-more'}
              size={24}
              color="#1E40AF"
            />
          </View>
        </TouchableOpacity>
        {openSection === 'profile' && (
          <View style={styles.cardContent}>
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
          </View>
        )}

        {/* Carte Mes contacts */}
        <TouchableOpacity style={styles.card} onPress={() => toggleSection('contacts')}>
          <View style={styles.cardHeader}>
            <Icon name="contacts" size={24} color="#22C55E" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Mes contacts</Text>
            <Icon
              name={openSection === 'contacts' ? 'expand-less' : 'expand-more'}
              size={24}
              color="#1E40AF"
            />
          </View>
        </TouchableOpacity>
        {openSection === 'contacts' && (
          <View style={styles.cardContent}>
            {addingContact ? (
              <View style={styles.card}>
                <TextInput
                  style={styles.input}
                  placeholder="Nom *"
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
                <TouchableOpacity
                  style={styles.buttonRed}
                  onPress={() => {
                    setContactForm({ name: '', email: '', phone: '' });
                    setEditingContactId(null);
                    setAddingContact(false);
                  }}
                >
                  <Text style={styles.buttonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <FlatList
                  data={contacts}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <ContactCard
                      contact={item}
                      onEdit={(c) => {
                        setEditingContactId(c.id);
                        setContactForm({ name: c.name, email: c.email || '', phone: c.phone || '' });
                        setAddingContact(true);
                      }}
                      onDelete={handleDeleteContact}
                    />
                  )}
                  ListEmptyComponent={<Text style={styles.emptyText}>Aucun contact trouvé</Text>}
                />
                <TouchableOpacity style={styles.buttonBlue} onPress={() => setAddingContact(true)}>
                  <Text style={styles.buttonText}>Ajouter un contact</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Carte Mes médecins */}
        <TouchableOpacity style={styles.card} onPress={() => toggleSection('doctors')}>
          <View style={styles.cardHeader}>
            <Icon name="medical-services" size={24} color="#1E40AF" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Mes médecins</Text>
            <Icon
              name={openSection === 'doctors' ? 'expand-less' : 'expand-more'}
              size={24}
              color="#1E40AF"
            />
          </View>
        </TouchableOpacity>
        {openSection === 'doctors' && (
          <View style={styles.cardContent}>
            {addingDoctor ? (
              <View style={styles.card}>
                <Picker
                  selectedValue={selectedDoctorId}
                  onValueChange={(itemValue) => setSelectedDoctorId(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Sélectionner un médecin" value={null} />
                  {publicDoctors.map((doctor) => (
                    <Picker.Item
                      key={doctor.id}
                      label={`${doctor.fullName} (${doctor.specialty?.name || 'Non spécifié'})`}
                      value={doctor.id}
                    />
                  ))}
                </Picker>
                <TouchableOpacity style={styles.buttonGreen} onPress={handleAddDoctor}>
                  <Text style={styles.buttonText}>Ajouter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonRed} onPress={() => setAddingDoctor(false)}>
                  <Text style={styles.buttonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <FlatList
                  data={patientDoctors}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <DoctorCard doctor={item} onDelete={handleRemoveDoctor} />
                  )}
                  ListEmptyComponent={<Text style={styles.emptyText}>Aucun médecin associé</Text>}
                />
                <TouchableOpacity style={styles.buttonBlue} onPress={() => setAddingDoctor(true)}>
                  <Text style={styles.buttonText}>Ajouter un médecin</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    flex: 1,
  },
  cardContent: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1E40AF',
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
    color: '#000000',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#1E40AF',
    borderRadius: 6,
    marginBottom: 12,
    color: '#000000',
  },
  buttonBlue: {
    backgroundColor: '#1E40AF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 6,
  },
  buttonGreen: {
    backgroundColor: '#22C55E',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 6,
  },
  buttonRed: {
    backgroundColor: '#DC2626',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 12,
  },
});

export default ProfileScreen;