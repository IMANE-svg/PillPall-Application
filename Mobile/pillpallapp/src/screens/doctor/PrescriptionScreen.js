import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet, Image, Linking, SafeAreaView } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/Header';
import PrescriptionCard from '../../components/PrescriptionCard';
import { getPrescriptionsByPatient, createPrescription, updatePrescription, deletePrescription, getPatients, scanPrescription } from '../../api/doctor';
import { logout } from '../../utils/auth';

const PrescriptionScreen = ({ navigation }) => {
  const [patientId, setPatientId] = useState('');
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [form, setForm] = useState({
    patientId: '',
    medicationName: '',
    dosage: '',
    startDate: '',
    endDate: '',
    doseTimes: [{ hour: '', minute: '' }],
  });
  const [mode, setMode] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [photo, setPhoto] = useState(null);
  const devices = useCameraDevices();
  const device = devices.back;
  const cameraRef = useRef(null);

  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        const status = await Camera.requestCameraPermission();
        console.log('Statut permission caméra:', status);
        setHasPermission(status === 'granted');
        if (status !== 'granted') {
          Alert.alert(
            'Permission refusée',
            'L’accès à la caméra est requis pour scanner les prescriptions.',
            [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Ouvrir paramètres', onPress: () => Linking.openSettings() },
            ]
          );
        }
      } catch (error) {
        console.error('Erreur vérification caméra:', error);
        Alert.alert('Erreur', 'Échec de la vérification de la permission caméra');
        setHasPermission(false);
      }
    };
    console.log('Devices disponibles:', JSON.stringify(devices, null, 2));
    checkCameraPermission();
    getPatients()
      .then((res) => {
        console.log('Patients:', res.data);
        setPatients(Array.isArray(res.data) ? res.data : []);
      })
      .catch((error) => {
        console.error('Erreur getPatients:', error.response?.data || error.message);
        Alert.alert('Erreur', 'Impossible de charger les patients');
        setPatients([]);
      });
  }, [devices]);

  useEffect(() => {
    if (patientId) {
      console.log('Fetching prescriptions for patientId:', patientId);
      fetchPrescriptions();
      setForm((prevForm) => ({ ...prevForm, patientId }));
    } else {
      setPrescriptions([]);
      setForm((prevForm) => ({ ...prevForm, patientId: '' }));
    }
  }, [patientId]);

  const fetchPrescriptions = async () => {
    if (!patientId) {
      console.log('No patientId, resetting prescriptions');
      setPrescriptions([]);
      return;
    }
    try {
      console.log('Calling getPrescriptionsByPatient with patientId:', patientId);
      const res = await getPrescriptionsByPatient(patientId);
      console.log('Réponse brute API prescriptions:', JSON.stringify(res, null, 2));
      if (!res.data) {
        console.warn('Aucune donnée dans res.data');
        setPrescriptions([]);
        Alert.alert('Info', 'Aucune prescription trouvée pour ce patient');
        return;
      }
      if (!Array.isArray(res.data)) {
        console.error('Erreur: res.data n\'est pas un tableau:', res.data);
        setPrescriptions([]);
        Alert.alert('Erreur', 'Réponse invalide du serveur');
        return;
      }
      const validPrescriptions = res.data.filter(
        (p) => p && p.id != null && typeof p.id !== 'undefined'
      );
      console.log('Prescriptions filtrées:', validPrescriptions);
      setPrescriptions(validPrescriptions);
    } catch (error) {
      console.error('Erreur fetchPrescriptions:', error.response?.data || error.message);
      Alert.alert('Erreur', 'Impossible de charger les prescriptions: ' + (error.response?.data?.message || error.message));
      setPrescriptions([]);
    }
  };

  const handleScan = async () => {
    console.log('handleScan called, hasPermission:', hasPermission, 'device:', !!device, 'cameraRef:', !!cameraRef.current);
    if (!device) {
      Alert.alert('Erreur', 'Aucune caméra détectée. Vérifiez si une caméra est disponible sur cet appareil.');
      return;
    }
    if (hasPermission === null) {
      Alert.alert('Erreur', 'La permission caméra n\'a pas encore été vérifiée. Veuillez réessayer.');
      return;
    }
    if (!hasPermission) {
      Alert.alert('Erreur', 'Permission caméra non accordée. Veuillez activer la permission dans les paramètres.');
      return;
    }
    if (!cameraRef.current) {
      Alert.alert('Erreur', 'Caméra non initialisée. Veuillez réessayer.');
      return;
    }
    try {
      const takenPhoto = await cameraRef.current.takePhoto();
      console.log('Photo prise:', takenPhoto);
      setPhoto(`file://${takenPhoto.path}`);
    } catch (error) {
      console.error('Erreur handleScan:', error);
      Alert.alert('Erreur', 'Échec de la capture de l’image: ' + error.message);
    }
  };

  const handleUploadScan = async () => {
    console.log('handleUploadScan called, photo:', photo, 'patientId:', patientId);
    if (!photo) {
      Alert.alert('Erreur', 'Aucune photo sélectionnée');
      return;
    }
    if (!patientId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un patient');
      return;
    }
    try {
      const file = { uri: photo, type: 'image/jpeg', name: 'scan.jpg' };
      console.log('Envoi fichier:', file);
      const res = await scanPrescription(patientId, file);
      console.log('Réponse scanPrescription:', res.data);
      const { medicationName, dosage, startDate, endDate, doseTimes } = res.data;
      setForm({
        patientId,
        medicationName: medicationName || '',
        dosage: dosage || '',
        startDate: startDate || '',
        endDate: endDate || '',
        doseTimes: doseTimes && Array.isArray(doseTimes)
          ? doseTimes.map((time) => ({
              hour: time.hour?.toString() || '',
              minute: time.minute?.toString() || '',
            }))
          : [{ hour: '', minute: '' }],
      });
      setMode('manual');
      setPhoto(null);
      Alert.alert('Succès', 'Prescription scannée, veuillez vérifier les champs');
      fetchPrescriptions();
    } catch (error) {
      console.error('Erreur handleUploadScan:', error.response?.data || error.message);
      Alert.alert('Erreur', 'Échec du traitement de l’image: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async () => {
    if (!form.patientId || !form.medicationName || !form.dosage || !form.startDate || !form.endDate || form.doseTimes.some(dt => !dt.hour || !dt.minute)) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    try {
      const data = {
        patientId: parseInt(form.patientId),
        medicationName: form.medicationName,
        dosage: form.dosage,
        startDate: form.startDate,
        endDate: form.endDate,
        doseTimes: form.doseTimes.map(dt => ({
          hour: parseInt(dt.hour),
          minute: parseInt(dt.minute),
        })),
      };
      console.log('Envoi prescription:', data);
      if (editingId) {
        await updatePrescription(editingId, data);
        Alert.alert('Succès', 'Prescription modifiée');
      } else {
        await createPrescription(data);
        Alert.alert('Succès', 'Prescription ajoutée');
      }
      setMode(null);
      setForm({
        patientId: patientId,
        medicationName: '',
        dosage: '',
        startDate: '',
        endDate: '',
        doseTimes: [{ hour: '', minute: '' }],
      });
      setEditingId(null);
      fetchPrescriptions();
    } catch (error) {
      console.error('Erreur handleSubmit:', error.response?.data || error.message);
      let errorMessage = 'Échec de l’opération';
      if (error.response?.status === 400) {
        errorMessage = 'Données invalides';
      } else if (error.response?.status === 403) {
        errorMessage = 'Patient non associé';
      } else if (error.response?.status === 404) {
        errorMessage = 'Patient non trouvé';
      } else if (error.response?.status === 500) {
        errorMessage = 'Erreur serveur: ' + (error.response?.data?.message || error.message);
      }
      Alert.alert('Erreur', errorMessage);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePrescription(id);
      Alert.alert('Succès', 'Prescription supprimée');
      fetchPrescriptions();
    } catch (error) {
      console.error('Erreur handleDelete:', error.response?.data || error.message);
      let errorMessage = 'Échec de la suppression';
      if (error.response?.status === 500 && error.response?.data?.message?.includes('intake_events')) {
        errorMessage = 'Impossible de supprimer: des événements associés existent';
      }
      Alert.alert('Erreur', errorMessage);
    }
  };

  const addDoseTime = () => {
    setForm({ ...form, doseTimes: [...form.doseTimes, { hour: '', minute: '' }] });
  };

  const updateDoseTime = (index, field, value) => {
    console.log(`Mise à jour doseTime[${index}].${field} = ${value}`);
    const newDoseTimes = [...form.doseTimes];
    newDoseTimes[index] = { ...newDoseTimes[index], [field]: value };
    setForm({ ...form, doseTimes: newDoseTimes });
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <View style={styles.pickerContainer}>
          <Icon name="person" size={20} color="#1E40AF" style={styles.pickerIcon} />
          <Picker
            selectedValue={patientId}
            onValueChange={(value) => {
              console.log('Patient sélectionné:', value);
              setPatientId(value);
            }}
            style={styles.picker}
          >
            <Picker.Item label="Sélectionner un patient" value="" />
            {patients.map((p) => (
              <Picker.Item
                key={p.id || `patient-${Math.random()}`}
                label={`${p.fullName || 'Nom inconnu'} (${p.email || 'Email inconnu'})`}
                value={p.id ? p.id.toString() : ''}
              />
            ))}
          </Picker>
        </View>
        {patientId && !mode && (
          <View style={styles.prescriptionContainer}>
            <Text style={styles.sectionTitle}>Prescriptions du patient</Text>
            {prescriptions.length > 0 ? (
              <FlatList
                data={prescriptions}
                keyExtractor={(item, index) => (item.id ? item.id.toString() : `fallback-${index}`)}
                renderItem={({ item }) => (
                  <PrescriptionCard
                    prescription={item}
                    onEdit={(p) => {
                      console.log('Editing prescription:', p);
                      setEditingId(p.id);
                      setForm({
                        patientId: patientId || p.patientId?.toString() || '',
                        medicationName: p.medicationName || '',
                        dosage: p.dosage || '',
                        startDate: p.startDate || '',
                        endDate: p.endDate || '',
                        doseTimes: p.doseTimes && Array.isArray(p.doseTimes)
                          ? p.doseTimes.map((time) => ({
                              hour: time.hour?.toString() || '',
                              minute: time.minute?.toString() || '',
                            }))
                          : [{ hour: '', minute: '' }],
                      });
                      setMode('manual');
                    }}
                    onDelete={handleDelete}
                  />
                )}
                style={styles.prescriptionList}
              />
            ) : (
              <Text style={styles.noPrescriptionsText}>Aucune prescription pour ce patient.</Text>
            )}
          </View>
        )}
        {!mode && patientId && (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.blueButton} onPress={() => {
              console.log('Mode manuel activé');
              setMode('manual');
            }}>
              <Text style={styles.buttonText}>Ajouter manuellement</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.blueButton} onPress={() => {
              console.log('Mode scan activé');
              setMode('scan');
            }}>
              <Text style={styles.buttonText}>Scanner</Text>
            </TouchableOpacity>
          </View>
        )}
        {mode === 'manual' && (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Ajouter/Modifier une prescription</Text>
            <View style={styles.inputContainer}>
              <Icon name="medication" size={20} color="#1E40AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nom du médicament"
                placeholderTextColor="#666666"
                value={form.medicationName}
                onChangeText={(text) => setForm({ ...form, medicationName: text })}
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon name="science" size={20} color="#1E40AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Dosage"
                placeholderTextColor="#666666"
                value={form.dosage}
                onChangeText={(text) => setForm({ ...form, dosage: text })}
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon name="calendar-today" size={20} color="#1E40AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Date début (YYYY-MM-DD)"
                placeholderTextColor="#666666"
                value={form.startDate}
                onChangeText={(text) => setForm({ ...form, startDate: text })}
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon name="calendar-today" size={20} color="#1E40AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Date fin (YYYY-MM-DD)"
                placeholderTextColor="#666666"
                value={form.endDate}
                onChangeText={(text) => setForm({ ...form, endDate: text })}
              />
            </View>
            {form.doseTimes.map((dose, index) => (
              <View key={index} style={styles.doseTime}>
                <View style={styles.inputContainer}>
                  <Icon name="access-time" size={20} color="#1E40AF" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Heure (0-23)"
                    placeholderTextColor="#666666"
                    value={dose.hour}
                    onChangeText={(text) => updateDoseTime(index, 'hour', text)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Icon name="access-time" size={20} color="#1E40AF" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Minute (0-59)"
                    placeholderTextColor="#666666"
                    value={dose.minute}
                    onChangeText={(text) => updateDoseTime(index, 'minute', text)}
                    keyboardType="numeric"
                  />
                </View>
                {index > 0 && (
                  <TouchableOpacity
                    style={styles.redButton}
                    onPress={() => {
                      const newDoseTimes = form.doseTimes.filter((_, i) => i !== index);
                      setForm({ ...form, doseTimes: newDoseTimes });
                    }}
                  >
                    <Text style={styles.buttonText}>-</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.greenButton} onPress={addDoseTime}>
              <Text style={styles.buttonText}>Ajouter horaire</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.greenButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>{editingId ? 'Modifier' : 'Ajouter'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.redButton} onPress={() => {
              console.log('Annuler formulaire, mode:', null);
              setMode(null);
              setForm({
                patientId: patientId,
                medicationName: '',
                dosage: '',
                startDate: '',
                endDate: '',
                doseTimes: [{ hour: '', minute: '' }],
              });
              setEditingId(null);
            }}>
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        )}
        {mode === 'scan' && (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Scanner une prescription</Text>
            {device && hasPermission ? (
              <>
                <Camera
                  ref={cameraRef}
                  style={styles.camera}
                  device={device}
                  isActive={mode === 'scan'}
                  photo={true}
                />
                <TouchableOpacity style={styles.blueButton} onPress={handleScan}>
                  <Text style={styles.buttonText}>Capturer</Text>
                </TouchableOpacity>
                {photo && (
                  <>
                    <Image source={{ uri: photo }} style={styles.preview} />
                    <TouchableOpacity style={styles.greenButton} onPress={handleUploadScan}>
                      <Text style={styles.buttonText}>Traiter l’image</Text>
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity
                  style={styles.redButton}
                  onPress={() => {
                    console.log('Annuler scan, mode:', null);
                    setMode(null);
                    setPhoto(null);
                  }}
                >
                  <Text style={styles.buttonText}>Annuler</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.redText}>
                Caméra non disponible ou permission refusée. Vérifiez les paramètres de votre appareil.
              </Text>
            )}
          </View>
        )}
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => {
            console.log('Ouvrir formulaire manuel, mode:', 'manual');
            setMode('manual');
            setForm({
              patientId: patientId,
              medicationName: '',
              dosage: '',
              startDate: '',
              endDate: '',
              doseTimes: [{ hour: '', minute: '' }],
            });
            setEditingId(null);
          }}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E40AF',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: '#F8F8F8',
  },
  pickerIcon: { marginRight: 8 },
  picker: { flex: 1, color: '#000000' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E40AF',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: '#F8F8F8',
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: '#000000',
  },
  doseTime: {
    flexDirection: 'column',
    marginBottom: 12,
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  blueButton: { backgroundColor: '#1E40AF', padding: 12, borderRadius: 6, alignItems: 'center' },
  greenButton: { backgroundColor: '#10B981', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  redButton: {
    backgroundColor: '#EF4444',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '600' },
  redText: { color: '#EF4444', textAlign: 'center', marginVertical: 8 },
  floatingButton: { backgroundColor: '#1E40AF', padding: 16, borderRadius: 30, position: 'absolute', bottom: 16, right: 16, alignItems: 'center' },
  preview: { width: '100%', height: 200, marginVertical: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E40AF', marginVertical: 12 },
  noPrescriptionsText: { fontSize: 16, color: '#666666', textAlign: 'center', marginVertical: 12 },
  prescriptionList: { flexGrow: 0 },
  prescriptionContainer: { marginBottom: 16 },
  formContainer: { marginBottom: 16 },
  camera: { width: '100%', height: 300, marginBottom: 12 },
});

export default PrescriptionScreen;