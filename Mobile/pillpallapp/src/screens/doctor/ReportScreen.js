import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/Header';
import { generateReport, downloadReportPdf, getPatients } from '../../api/doctor';
import { logout } from '../../utils/auth';
import moment from 'moment';
import ReactNativeBlobUtil from 'react-native-blob-util';

const ReportScreen = ({ navigation }) => {
  const [patientId, setPatientId] = useState('');
  const [patients, setPatients] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [report, setReport] = useState(null);

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

  const handleGenerate = async () => {
    if (!patientId || !from || !to) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (!moment(from, 'YYYY-MM-DD', true).isValid() || !moment(to, 'YYYY-MM-DD', true).isValid()) {
      Alert.alert('Erreur', 'Les dates doivent être au format YYYY-MM-DD');
      return;
    }
    try {
      console.log('Génération rapport - patientId:', patientId, 'from:', from, 'to:', to);
      const res = await generateReport(patientId, from, to);
      if (res.data.message && res.data.report) {
        Alert.alert('Information', res.data.message);
        setReport(res.data.report);
      } else {
        setReport(res.data);
      }
    } catch (error) {
      console.error('Erreur handleGenerate:', error.response?.data || error.message);
      let errorMessage = 'Échec de la génération du rapport';
      if (error.response?.status === 400) {
        errorMessage = error.response.data || 'Paramètres de requête invalides';
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'Session invalide. Veuillez vous reconnecter.';
        await logout();
        navigation.replace('Login');
      } else if (error.response?.status === 404) {
        errorMessage = error.response.data || 'Patient ou données non trouvés';
      } else if (error.response?.status === 500) {
        errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
      }
      Alert.alert('Erreur', errorMessage);
    }
  };

  const handleDownloadPdf = async () => {
    if (!patientId || !from || !to) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (!moment(from, 'YYYY-MM-DD', true).isValid() || !moment(to, 'YYYY-MM-DD', true).isValid()) {
      Alert.alert('Erreur', 'Les dates doivent être au format YYYY-MM-DD');
      return;
    }
    try {
      console.log('Téléchargement PDF - patientId:', patientId, 'from:', from, 'to:', to);
      const res = await downloadReportPdf(patientId, from, to);
      const date = moment().format('YYYYMMDD_HHmmss');
      const filePath = Platform.OS === 'ios'
        ? `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/rapport-${patientId}-${date}.pdf`
        : `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/rapport-${patientId}-${date}.pdf`;

      await ReactNativeBlobUtil.fs.writeFile(filePath, res.data, 'base64');
      Alert.alert('Succès', `Rapport téléchargé à : ${filePath}`);
      if (Platform.OS === 'android') {
        ReactNativeBlobUtil.android.actionViewIntent(filePath, 'application/pdf');
      } else {
        ReactNativeBlobUtil.ios.previewDocument(filePath);
      }
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error.response?.data || error.message);
      let errorMessage = 'Échec du téléchargement du rapport';
      if (error.response?.status === 400) {
        errorMessage = 'Paramètres de requête invalides';
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'Session invalide. Veuillez vous reconnecter.';
        await logout();
        navigation.replace('Login');
      } else if (error.response?.status === 404) {
        errorMessage = 'Patient non trouvé';
      } else if (error.response?.status === 500) {
        errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
      }
      Alert.alert('Erreur', errorMessage);
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
        <View style={styles.inputContainer}>
          <Icon name="calendar-today" size={20} color="#1E40AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Date début (YYYY-MM-DD)"
            placeholderTextColor="#666666"
            value={from}
            onChangeText={setFrom}
          />
        </View>
        <View style={styles.inputContainer}>
          <Icon name="calendar-today" size={20} color="#1E40AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Date fin (YYYY-MM-DD)"
            placeholderTextColor="#666666"
            value={to}
            onChangeText={setTo}
          />
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={handleGenerate}>
            <Text style={styles.buttonText}>Générer rapport</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleDownloadPdf}>
            <Icon name="download" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Télécharger PDF</Text>
          </TouchableOpacity>
        </View>

        {report ? (
          <View style={styles.report}>
            <Text style={styles.sectionTitle}>Informations du patient</Text>
            <View style={styles.card}>
              <Icon name="person" size={24} color="#1E40AF" style={styles.cardIcon} />
              <View>
                <Text style={styles.detail}>Nom: {report.patientInfo?.fullName || 'N/A'}</Text>
                <Text style={styles.detail}>Email: {report.patientInfo?.email || 'N/A'}</Text>
                <Text style={styles.detail}>
                  Date de naissance: {report.patientInfo?.birthDate ? moment(report.patientInfo.birthDate).format('DD/MM/YYYY') : 'N/A'}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Prescriptions</Text>
            {report.prescriptions && report.prescriptions.length > 0 ? (
              <FlatList
                data={report.prescriptions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.card}>
                    <Icon name="medication" size={24} color="#1E40AF" style={styles.cardIcon} />
                    <View>
                      <Text style={styles.detail}>Médicament: {item.medicationName || 'N/A'}</Text>
                      <Text style={styles.detail}>Dosage: {item.dosage || 'N/A'}</Text>
                      <Text style={styles.detail}>Début: {moment(item.startDate).format('DD/MM/YYYY') || 'N/A'}</Text>
                      <Text style={styles.detail}>Fin: {moment(item.endDate).format('DD/MM/YYYY') || 'N/A'}</Text>
                    </View>
                  </View>
                )}
              />
            ) : (
              <Text style={styles.noData}>Aucune prescription disponible</Text>
            )}

            <Text style={styles.sectionTitle}>Observance</Text>
            <View style={styles.card}>
              <Icon name="check-circle" size={24} color="#1E40AF" style={styles.cardIcon} />
              <View>
                <Text style={styles.detail}>Taux d'observance: {(report.adherenceRate * 100).toFixed(2)}%</Text>
                <Text style={styles.detail}>Doses manquées: {report.missedDoses || 0}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Anomalies</Text>
            {report.anomalies && report.anomalies.length > 0 ? (
              <FlatList
                data={report.anomalies}
                keyExtractor={(item) => item.detectedAt.toString()}
                renderItem={({ item }) => (
                  <View style={styles.card}>
                    <Icon name="warning" size={24} color="#EF4444" style={styles.cardIcon} />
                    <View>
                      <Text style={styles.detail}>Type: {item.type || 'N/A'}</Text>
                      <Text style={styles.detail}>Sévérité: {item.severity || 'N/A'}</Text>
                      <Text style={styles.detail}>Description: {item.description || 'N/A'}</Text>
                      <Text style={styles.detail}>Détecté: {moment(item.detectedAt).format('DD/MM/YYYY HH:mm') || 'N/A'}</Text>
                    </View>
                  </View>
                )}
              />
            ) : (
              <Text style={styles.noData}>Aucune anomalie détectée</Text>
            )}

            <Text style={styles.sectionTitle}>Danger</Text>
            <View style={styles.card}>
              <Icon name="error" size={24} color={report.hasDanger ? '#EF4444' : '#10B981'} style={styles.cardIcon} />
              <Text style={styles.detail}>{report.hasDanger ? 'Oui' : 'Non'}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noData}>Aucun rapport généré</Text>
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#1E40AF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonIcon: { marginRight: 8 },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  report: { marginTop: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginVertical: 8,
  },
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
  noData: {
    textAlign: 'center',
    color: '#666666',
    marginVertical: 16,
    fontSize: 16,
  },
});

export default ReportScreen;