import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import axios from 'axios';
import Header from '../../components/Header';
import PrescriptionCard from '../../components/PrescriptionCard';
import { getPrescriptionsByPatient, createPrescription, updatePrescription, deletePrescription } from '../../api/doctor';
import { logout } from '../../utils/auth';
import { getAuthHeaders } from '../../api/auth';

const PrescriptionScreen = ({ navigation }) => {
  const [patientId, setPatientId] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [form, setForm] = useState({
    patientId: '',
    medicationName: '',
    dosage: '',
    startDate: '',
    endDate: '',
    doseTimes: [{ hour: '', minute: '' }],
  });
  const [mode, setMode] = useState(null); // 'manual' or 'scan'
  const [editingId, setEditingId] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [photo, setPhoto] = useState(null);
  const devices = useCameraDevices();
  const device = devices.back;
  const cameraRef = useRef(null);

  useEffect(() => {
    Camera.requestCameraPermission().then((status) => setHasPermission(status === 'authorized'));
  }, []);

  const fetchPrescriptions = async () => {
    if (patientId) {
      try {
        const res = await getPrescriptionsByPatient(patientId);
        setPrescriptions(res.data);
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de charger les prescriptions');
      }
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId]);

  const handleScan = async () => {
    if (cameraRef.current) {
      try {
        const takenPhoto = await cameraRef.current.takePhoto();
        setPhoto(`file://${takenPhoto.path}`);
      } catch (error) {
        Alert.alert('Erreur', 'Échec de la capture de l’image');
      }
    }
  };

  const handleUploadScan = async () => {
    try {
      const headers = await getAuthHeaders();
      const formData = new FormData();
      formData.append('file', {
        uri: photo,
        type: 'image/jpeg',
        name: 'scan.jpg',
      });
      formData.append('patientId', patientId);

      const res = await axios.post('http://192.168.1.11:8080/api/doctor/prescriptions/scan', formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      });

      const { medicationName, dosage, startDate, endDate, doseTimes } = res.data;
      setForm({
        ...form,
        medicationName: medicationName || '',
        dosage: dosage || '',
        startDate: startDate || '',
        endDate: endDate || '',
        doseTimes: doseTimes ? doseTimes.split(',').map((time) => {
          const [hour, minute] = time.split(':');
          return { hour: hour || '', minute: minute || '' };
        }) : [{ hour: '', minute: '' }],
      });
      setMode('manual'); // Passe en mode manuel pour ajuster les champs
      setPhoto(null);
    } catch (error) {
      Alert.alert('Erreur', 'Échec du traitement de l’image');
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updatePrescription(editingId, form);
      } else {
        await createPrescription({ ...form, patientId });
      }
      fetchPrescriptions();
      setForm({
        patientId: '',
        medicationName: '',
        dosage: '',
        startDate: '',
        endDate: '',
        doseTimes: [{ hour: '', minute: '' }],
      });
      setEditingId(null);
      setMode(null);
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l’opération');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePrescription(id);
      fetchPrescriptions();
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
        onHistory={() => navigation.navigate('Historique')}
        showMenu
      />
      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="ID Patient"
          placeholderTextColor="#666666"
          value={patientId}
          onChangeText={setPatientId}
          keyboardType="numeric"
        />
        {!mode ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.blueButton} onPress={() => setMode('manual')}>
              <Text style={styles.buttonText}>Manuel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.blueButton} onPress={() => setMode('scan')}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
          </View>
        ) : mode === 'manual' ? (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Nom du médicament"
              placeholderTextColor="#666666"
              value={form.medicationName}
              onChangeText={(text) => setForm({ ...form, medicationName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Dosage"
              placeholderTextColor="#666666"
              value={form.dosage}
              onChangeText={(text) => setForm({ ...form, dosage: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Date début (YYYY-MM-DD)"
              placeholderTextColor="#666666"
              value={form.startDate}
              onChangeText={(text) => setForm({ ...form, startDate: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Date fin (YYYY-MM-DD)"
              placeholderTextColor="#666666"
              value={form.endDate}
              onChangeText={(text) => setForm({ ...form, endDate: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Heure (HH:MM)"
              placeholderTextColor="#666666"
              value={form.doseTimes[0].hour + ':' + form.doseTimes[0].minute}
              onChangeText={(text) => {
                const [hour, minute] = text.split(':');
                setForm({ ...form, doseTimes: [{ hour, minute }] });
              }}
            />
            <TouchableOpacity style={styles.greenButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>{editingId ? 'Modifier' : 'Ajouter'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            {device && hasPermission ? (
              <Camera
                ref={cameraRef}
                style={{ flex: 1 }}
                device={device}
                isActive={true}
                photo={true}
              />
            ) : (
              <Text style={styles.redText}>Caméra non disponible ou permission refusée</Text>
            )}
            <TouchableOpacity style={styles.blueButton} onPress={handleScan}>
              <Text style={styles.buttonText}>Capturer</Text>
            </TouchableOpacity>
            {photo && (
              <TouchableOpacity style={styles.greenButton} onPress={handleUploadScan}>
                <Text style={styles.buttonText}>Traiter l’image</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.redButton}
              onPress={() => {
                setMode(null);
                setPhoto(null);
              }}
            >
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        )}
        <FlatList
          data={prescriptions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PrescriptionCard
              prescription={item}
              onEdit={(p) => {
                setEditingId(p.id);
                setForm({
                  patientId: p.patient.id,
                  medicationName: p.medicationName,
                  dosage: p.dosage,
                  startDate: p.startDate,
                  endDate: p.endDate,
                  doseTimes: p.doseTimes,
                });
                setMode('manual');
              }}
              onDelete={handleDelete}
            />
          )}
        />
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setMode('manual')}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
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
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  blueButton: { backgroundColor: '#1E40AF', padding: 12, borderRadius: 6, alignItems: 'center' },
  greenButton: { backgroundColor: '#10B981', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  redButton: { backgroundColor: '#EF4444', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '600' },
  redText: { color: '#EF4444', textAlign: 'center', marginVertical: 8 },
  floatingButton: { backgroundColor: '#1E40AF', padding: 16, borderRadius: 30, position: 'absolute', bottom: 16, right: 16, alignItems: 'center' },
});

export default PrescriptionScreen;
