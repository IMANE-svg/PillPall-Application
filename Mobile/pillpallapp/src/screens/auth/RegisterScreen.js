import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, FlatList, Image, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { register } from '../../api/auth';
import axios from 'axios';

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'ROLE_PATIENT',
    specialtyId: null,
    doctorIds: [],
    timezone: 'Africa/Casablanca'
  });
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [showSpecialtyPicker, setShowSpecialtyPicker] = useState(false);
  const [specialtiesLoading, setSpecialtiesLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Charger les médecins avec leurs spécialités
        const doctorsResponse = await axios.get('http://192.168.1.11:8080/api/doctor/public');
        console.log('Doctors response:', doctorsResponse.data);
        setDoctors(doctorsResponse.data || []);

      } catch (error) {
        console.error('Error fetching doctors:', error);
        Alert.alert('Erreur', 'Impossible de charger les médecins');
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Charger les spécialités seulement quand on ouvre le picker
  const loadSpecialties = async () => {
    try {
      setSpecialtiesLoading(true);
      const response = await axios.get('http://192.168.1.11:8080/api/specialties/public');
      
      console.log('Spécialités API response:', response.data);
      
      // Vérifier la structure de la réponse
      if (Array.isArray(response.data)) {
        setSpecialties(response.data);
        console.log('Spécialités chargées:', response.data.length);
      } else {
        console.error('La réponse n\'est pas un tableau:', response.data);
        Alert.alert('Erreur', 'Format de données invalide pour les spécialités');
        setSpecialties([]);
      }
    } catch (error) {
      console.error('Error loading specialties:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      Alert.alert('Erreur', 'Impossible de charger les spécialités');
      setSpecialties([]);
    } finally {
      setSpecialtiesLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      // Validation
      if (!form.email || !form.password || !form.fullName) {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
        return;
      }

      if (form.role === 'ROLE_DOCTOR' && !form.specialtyId) {
        Alert.alert('Erreur', 'Veuillez sélectionner une spécialité');
        return;
      }

      if (form.role === 'ROLE_PATIENT' && form.doctorIds.length === 0) {
        Alert.alert('Erreur', 'Veuillez sélectionner au moins un médecin');
        return;
      }

      // Préparer les données pour l'API
      const registerData = {
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        role: form.role,
        timezone: form.timezone,
        specialtyId: form.role === 'ROLE_DOCTOR' ? form.specialtyId : null,
        doctorIds: form.role === 'ROLE_PATIENT' ? form.doctorIds : []
      };

      console.log('Données d\'inscription:', registerData);
      
      await register(registerData);
      Alert.alert('Succès', 'Inscription réussie ! Connectez-vous.');
      navigation.replace('Login');
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        Alert.alert('Erreur', error.response.data?.error || 'Inscription échouée');
      } else {
        Alert.alert('Erreur', 'Inscription échouée');
      }
    }
  };

  const toggleDoctorSelection = (doctorId) => {
    setForm(prev => ({
      ...prev,
      doctorIds: prev.doctorIds.includes(doctorId)
        ? prev.doctorIds.filter(id => id !== doctorId)
        : [...prev.doctorIds, doctorId]
    }));
  };

  const selectRole = (role) => {
    setForm({ 
      ...form, 
      role, 
      specialtyId: null, 
      doctorIds: [] 
    });
    setShowRolePicker(false);
  };

  const selectSpecialty = (specialtyId) => {
    setForm({ ...form, specialtyId });
    setShowSpecialtyPicker(false);
  };

  const openSpecialtyPicker = async () => {
    setShowSpecialtyPicker(true);
    await loadSpecialties();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.loadingText}>Chargement des médecins...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={require('../../assets/health-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      
      <Text style={styles.title}>Inscription</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nom complet *"
        placeholderTextColor="#666"
        value={form.fullName}
        onChangeText={(text) => setForm({ ...form, fullName: text })}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email *"
        placeholderTextColor="#666"
        value={form.email}
        onChangeText={(text) => setForm({ ...form, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Mot de passe *"
        placeholderTextColor="#666"
        value={form.password}
        onChangeText={(text) => setForm({ ...form, password: text })}
        secureTextEntry
      />
      
      {/* Sélecteur de rôle */}
      <Text style={styles.label}>Rôle *</Text>
      <TouchableOpacity 
        style={styles.pickerButton}
        onPress={() => setShowRolePicker(true)}
      >
        <Text style={styles.pickerButtonText}>
          {form.role === 'ROLE_PATIENT' ? 'Patient' : 'Médecin'}
        </Text>
        <Text style={styles.pickerArrow}>▼</Text>
      </TouchableOpacity>

      {/* Champ spécialité pour les médecins */}
      {form.role === 'ROLE_DOCTOR' && (
        <>
          <Text style={styles.label}>Spécialité *</Text>
          <TouchableOpacity 
            style={styles.pickerButton}
            onPress={openSpecialtyPicker}
            disabled={specialtiesLoading}
          >
            {specialtiesLoading ? (
              <ActivityIndicator size="small" color="#1E40AF" />
            ) : (
              <>
                <Text style={styles.pickerButtonText}>
                  {form.specialtyId 
                    ? specialties.find(s => s.id === form.specialtyId)?.name || 'Spécialité'
                    : 'Choisir une spécialité'
                  }
                </Text>
                <Text style={styles.pickerArrow}>▼</Text>
              </>
            )}
          </TouchableOpacity>
        </>
      )}

      {/* Sélection des médecins pour les patients */}
      {form.role === 'ROLE_PATIENT' && doctors.length > 0 && (
        <>
          <Text style={styles.label}>Choisir médecin(s) *</Text>
          <View style={styles.doctorsContainer}>
            <FlatList
              data={doctors}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.doctorItem,
                    form.doctorIds.includes(item.id) && styles.doctorItemSelected
                  ]}
                  onPress={() => toggleDoctorSelection(item.id)}
                >
                  <Text style={styles.doctorText}>
                    {item.fullName} {item.specialty && `(${item.specialty.name})`}
                  </Text>
                  <Text style={styles.checkbox}>
                    {form.doctorIds.includes(item.id) ? '✓' : '○'}
                  </Text>
                </TouchableOpacity>
              )}
              scrollEnabled={false}
            />
          </View>
        </>
      )}

      <TouchableOpacity 
        style={styles.registerButton} 
        onPress={handleRegister}
      >
        <Text style={styles.registerButtonText}>S'inscrire</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginLink}>Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>

      {/* Modal pour sélectionner le rôle */}
      <Modal
        visible={showRolePicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionner un rôle</Text>
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => selectRole('ROLE_PATIENT')}
            >
              <Text style={styles.modalOptionText}>Patient</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => selectRole('ROLE_DOCTOR')}
            >
              <Text style={styles.modalOptionText}>Médecin</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowRolePicker(false)}
            >
              <Text style={styles.modalCloseText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal pour sélectionner la spécialité */}
      <Modal
        visible={showSpecialtyPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionner une spécialité</Text>
            
            {specialtiesLoading ? (
              <ActivityIndicator size="large" color="#1E40AF" style={styles.loadingIndicator} />
            ) : specialties.length === 0 ? (
              <Text style={styles.noDataText}>Aucune spécialité disponible</Text>
            ) : (
              <ScrollView style={styles.modalScrollView}>
                {specialties.map((specialty) => (
                  <TouchableOpacity 
                    key={specialty.id}
                    style={styles.modalOption}
                    onPress={() => selectSpecialty(specialty.id)}
                  >
                    <Text style={styles.modalOptionText}>{specialty.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowSpecialtyPicker(false)}
            >
              <Text style={styles.modalCloseText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    color: '#1E40AF',
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    color: '#1E40AF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1E40AF',
    padding: 12,
    marginBottom: 16,
    borderRadius: 6,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#1E40AF',
    padding: 12,
    marginBottom: 16,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 50,
  },
  pickerButtonText: {
    color: '#1E40AF',
    fontSize: 16,
  },
  pickerArrow: {
    color: '#1E40AF',
    fontSize: 12,
  },
  doctorsContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E40AF',
    borderRadius: 6,
    padding: 8,
    maxHeight: 200,
  },
  doctorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  doctorItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  doctorText: {
    flex: 1,
    color: '#374151',
    fontSize: 14,
  },
  checkbox: {
    color: '#1E40AF',
    fontSize: 18,
    marginLeft: 8,
  },
  registerButton: {
    backgroundColor: '#1E40AF',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 16,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    color: '#1E40AF',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1E40AF',
    textAlign: 'center',
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  modalCloseButton: {
    padding: 15,
    backgroundColor: '#1E40AF',
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
    fontStyle: 'italic',
  },
};

export default RegisterScreen;