import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/Header';
import { getObservance, getPatients } from '../../api/doctor';
import { logout } from '../../utils/auth';
import moment from 'moment';

const ObservanceScreen = ({ navigation }) => {
  const [patientId, setPatientId] = useState('');
  const [patients, setPatients] = useState([]);
  const [observance, setObservance] = useState([]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (patientId) {
      console.log('Fetching observance for patientId:', patientId);
      fetchObservance();
    } else {
      setObservance([]);
    }
  }, [patientId]);

  const fetchObservance = async () => {
    try {
      console.log('Calling getObservance with patientId:', patientId);
      const res = await getObservance(patientId);
      console.log('Réponse brute API observance:', JSON.stringify(res.data, null, 2));
      if (typeof res.data === 'string') {
        console.warn('Aucune donnée d\'observance:', res.data);
        setObservance([]);
        Alert.alert('Info', res.data);
        return;
      }
      if (!Array.isArray(res.data)) {
        console.error('Erreur: res.data n\'est pas un tableau:', res.data);
        setObservance([]);
        Alert.alert('Erreur', 'Réponse invalide du serveur');
        return;
      }
      setObservance(res.data);
    } catch (error) {
      console.error('Erreur fetchObservance:', error.response?.data || error.message);
      let errorMessage = 'Impossible de charger les données d\'observance';
      if (error.response?.status === 403) {
        errorMessage = 'Patient non associé à ce médecin';
      } else if (error.response?.status === 404) {
        errorMessage = 'Patient non trouvé';
      } else if (error.response?.status === 500) {
        errorMessage = 'Erreur serveur: ' + (error.response?.data?.message || error.message);
      }
      Alert.alert('Erreur', errorMessage);
      setObservance([]);
    }
  };

  const formatDate = (isoDate) => {
    return isoDate ? moment(isoDate).format('DD/MM/YYYY HH:mm') : 'Non confirmé';
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
        {patientId && (
          <>
            <Text style={styles.sectionTitle}>Observance du patient</Text>
            {observance.length > 0 ? (
              <FlatList
                data={observance}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={styles.card}>
                    <Icon name="medication" size={24} color="#1E40AF" style={styles.cardIcon} />
                    <View>
                      <Text style={styles.detail}>Médicament: {item.medicationName || 'N/A'}</Text>
                      <Text style={styles.detail}>Horaire: {formatDate(item.scheduledAt)}</Text>
                      <Text style={styles.detail}>Statut: {item.status || 'N/A'}</Text>
                      <Text style={styles.detail}>Confirmé à: {formatDate(item.confirmedAt)}</Text>
                    </View>
                  </View>
                )}
              />
            ) : (
              <Text style={styles.noData}>Aucune donnée d'observance disponible</Text>
            )}
          </>
        )}
      </View>
    </View>
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: { marginRight: 12 },
  detail: { fontSize: 14, color: '#333333' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginVertical: 8,
  },
  noData: {
    textAlign: 'center',
    color: '#666666',
    marginVertical: 16,
    fontSize: 16,
  },
});

export default ObservanceScreen;