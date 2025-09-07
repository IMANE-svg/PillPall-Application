import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Header from '../../components/Header';
import { getIntakes, confirmIntake } from '../../api/patient';
import { logout } from '../../utils/auth';

const IntakesScreen = ({ navigation }) => {
  const [intakes, setIntakes] = useState([]);

  useEffect(() => {
    getIntakes().then((res) => setIntakes(res.data)).catch(() => {});
  }, []);

  const handleConfirm = async (intakeId) => {
    try {
      await confirmIntake(intakeId);
      setIntakes(intakes.map((i) => i.id === intakeId ? { ...i, status: 'CONFIRMED', confirmedAt: new Date().toISOString() } : i));
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la confirmation');
    }
  };

  const groupByMedication = intakes.reduce((acc, intake) => {
    const med = intake.prescription.medicationName;
    if (!acc[med]) acc[med] = [];
    acc[med].push(intake);
    return acc;
  }, {});

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
        {Object.keys(groupByMedication).map((med) => (
          <View key={med} style={styles.medicationGroup}>
            <Text style={styles.medicationTitle}>{med}</Text>
            <FlatList
              data={groupByMedication[med]}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.intakeRow}>
                  <View>
                    <Text>Date: {item.scheduledAt.split('T')[0]}</Text>
                    <Text>Horaire: {item.scheduledAt.split('T')[1].substring(0, 5)}</Text>
                    <Text>Confirmé: {item.confirmedAt || 'Non'}</Text>
                  </View>
                  {item.status === 'PENDING' && (
                    <TouchableOpacity style={styles.confirmButton} onPress={() => handleConfirm(item.id)}>
                      <Text style={styles.confirmText}>Pris</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  medicationGroup: { marginBottom: 16 },
  medicationTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  intakeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  confirmButton: { backgroundColor: '#22C55E', padding: 8, borderRadius: 6 },
  confirmText: { color: '#FFFFFF' },
});

export default IntakesScreen;
