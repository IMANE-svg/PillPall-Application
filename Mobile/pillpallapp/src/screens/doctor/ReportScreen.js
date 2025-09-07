import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Header from '../../components/Header';
import { generateReport } from '../../api/doctor';
import { logout } from '../../utils/auth';

const ReportScreen = ({ navigation }) => {
  const [patientId, setPatientId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [report, setReport] = useState(null);

  const handleGenerate = async () => {
    try {
      const res = await generateReport(patientId, from, to);
      setReport(res.data);
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la génération du rapport');
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
        <TextInput
          style={styles.input}
          placeholder="Date début (YYYY-MM-DD)"
          placeholderTextColor="#666666"
          value={from}
          onChangeText={setFrom}
        />
        <TextInput
          style={styles.input}
          placeholder="Date fin (YYYY-MM-DD)"
          placeholderTextColor="#666666"
          value={to}
          onChangeText={setTo}
        />
        <TouchableOpacity style={styles.button} onPress={handleGenerate}>
          <Text style={styles.buttonText}>Générer rapport</Text>
        </TouchableOpacity>

        {report && (
          <View style={styles.report}>
            <Text>Patient: {report.patientInfo.fullName}</Text>
            <Text>Taux d'observance: {(report.adherenceRate * 100).toFixed(2)}%</Text>
            <Text>Doses manquées: {report.missedDoses}</Text>
            <Text>Anomalies: {report.anomalies.length}</Text>
            <Text>Danger: {report.hasDanger ? 'Oui' : 'Non'}</Text>
          </View>
        )}
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
  button: {
    backgroundColor: '#1E40AF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  report: {
    marginTop: 16,
  },
});

export default ReportScreen;
