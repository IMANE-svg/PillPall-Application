import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import Header from '../../components/Header';
import { getMedications, getIntakes, confirmIntake } from '../../api/patient';
import { logout } from '../../utils/auth';
import moment from 'moment';

const IntakesScreen = ({ navigation, route }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [intakeHistory, setIntakeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmedIntake, setConfirmedIntake] = useState(route.params?.confirmedIntake || null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getMedications().then((res) => {
        console.log('Réponse prescriptions:', JSON.stringify(res.data, null, 2));
        setPrescriptions(res.data || []);
      }),
      getIntakes().then((res) => {
        console.log('Réponse history:', JSON.stringify(res.data, null, 2));
        setIntakeHistory(res.data || []);
      })
    ])
      .catch((err) => {
        console.error('Erreur fetch:', err.response?.data || err.message);
        Alert.alert('Erreur', 'Impossible de charger les données');
      })
      .finally(() => setLoading(false));
  }, [route.params]);

  const generateDays = (startDate, endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);
    const days = [];
    for (let d = start; d.isSameOrBefore(end); d.add(1, 'days')) {
      days.push(d.format('YYYY-MM-DD'));
    }
    return days;
  };

  const getIntakeForDayAndTime = (prescriptionId, day, doseTime) => {
    const hourStr = (doseTime.hour ?? 0).toString().padStart(2, '0');
    const minuteStr = (doseTime.minute ?? 0).toString().padStart(2, '0');
    const timeStr = `${hourStr}:${minuteStr}`;
    
    return intakeHistory.find((e) => {
      const isSamePrescription = e.medication === prescriptions.find(p => p.id === prescriptionId)?.medication;
      const isSameDay = moment(e.scheduledTime).format('YYYY-MM-DD') === day;
      const isSameTime = moment(e.scheduledTime).format('HH:mm') === timeStr;
      return isSamePrescription && isSameDay && isSameTime;
    }) || (confirmedIntake && confirmedIntake.intakeId && 
           confirmedIntake.intakeId.toString() === `${prescriptionId}-${day}-${timeStr}` 
           ? { id: confirmedIntake.intakeId, actualTime: confirmedIntake.confirmedAt, status: 'CONFIRMED' } 
           : null);
  };

  const handleConfirm = async (prescriptionId, day, doseTime) => {
    const intake = getIntakeForDayAndTime(prescriptionId, day, doseTime);
    const hourStr = (doseTime.hour ?? 0).toString().padStart(2, '0');
    const minuteStr = (doseTime.minute ?? 0).toString().padStart(2, '0');
    const timeStr = `${hourStr}:${minuteStr}`;
    const intakeId = intake?.id || `${prescriptionId}-${day}-${timeStr}`; // Fallback ID

    try {
      await confirmIntake(intakeId);
      const confirmedAt = new Date().toISOString();
      setIntakeHistory((prev) => [
        ...prev.filter(e => e.id !== intakeId),
        { 
          id: intakeId, 
          medication: prescriptions.find(p => p.id === prescriptionId)?.medication, 
          scheduledTime: moment(`${day} ${timeStr}`, 'YYYY-MM-DD HH:mm').toISOString(),
          actualTime: confirmedAt, 
          status: 'CONFIRMED',
          dosage: prescriptions.find(p => p.id === prescriptionId)?.dosage
        }
      ]);
      setConfirmedIntake({ intakeId, confirmedAt });
      Alert.alert('Succès', 'Prise confirmée');
    } catch (error) {
      console.error('Erreur confirmation:', error.response?.data || error.message);
      Alert.alert('Erreur', 'Échec de la confirmation');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="PillPall" onLogout={() => { logout(); navigation.replace('Login'); }} />
        <ActivityIndicator size="large" color="#1E40AF" style={styles.loader} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="PillPall" onLogout={() => { logout(); navigation.replace('Login'); }} />
      <View style={styles.content}>
        {prescriptions.length === 0 ? (
          <Text style={styles.emptyText}>Aucune prescription trouvée</Text>
        ) : (
          <FlatList
            data={prescriptions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item: prescription }) => (
              <View style={styles.medicationCard}>
                <Text style={styles.medicationTitle}>{prescription.medication || 'N/A'}</Text>
                <FlatList
                  data={generateDays(prescription.startDate, prescription.endDate)}
                  keyExtractor={(day) => day}
                  renderItem={({ item: day }) => (
                    <View style={styles.dayRow}>
                      <Text style={styles.dayText}>{moment(day).format('DD/MM/YYYY')}</Text>
                      {prescription.doseTimes?.map((doseTime, index) => {
                        const intake = getIntakeForDayAndTime(prescription.id, day, doseTime);
                        const hourStr = (doseTime.hour ?? 0).toString().padStart(2, '0');
                        const minuteStr = (doseTime.minute ?? 0).toString().padStart(2, '0');
                        const timeStr = `${hourStr}:${minuteStr}`;
                        const isConfirmed = intake?.status === 'CONFIRMED' || !!intake?.actualTime;
                        return (
                          <View key={index} style={styles.intakeRow}>
                            <View style={styles.intakeInfo}>
                              <Text style={styles.intakeText}>Horaire : {timeStr}</Text>
                              <Text style={styles.intakeText}>
                                Heure réelle : {intake?.actualTime ? moment(intake.actualTime).format('HH:mm') : 'Non prise'}
                              </Text>
                            </View>
                            <TouchableOpacity 
                              style={[styles.confirmButton, isConfirmed ? styles.confirmedButton : styles.pendingButton]} 
                              onPress={() => handleConfirm(prescription.id, day, doseTime)}
                              disabled={isConfirmed}
                            >
                              <Text style={styles.confirmText}>
                                {isConfirmed ? 'Pris' : 'Confirmer'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  )}
                  ListEmptyComponent={<Text style={styles.emptyText}>Aucun jour trouvé</Text>}
                />
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>Aucune prescription trouvée</Text>}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  loader: { flex: 1, justifyContent: 'center' },
  medicationCard: { 
    backgroundColor: '#F3F4F6', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 2 
  },
  medicationTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#1E40AF', 
    marginBottom: 8 
  },
  dayRow: { 
    paddingVertical: 8, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB' 
  },
  dayText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#1E40AF', 
    marginBottom: 4 
  },
  intakeRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 8 
  },
  intakeInfo: { 
    flex: 1 
  },
  intakeText: { 
    fontSize: 14, 
    color: '#374151', 
    marginBottom: 4 
  },
  confirmButton: { 
    padding: 10, 
    borderRadius: 6, 
    minWidth: 80, 
    alignItems: 'center' 
  },
  pendingButton: { 
    backgroundColor: '#6B7280' 
  },
  confirmedButton: { 
    backgroundColor: '#22C55E' 
  },
  confirmText: { 
    color: '#FFFFFF', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  emptyText: { 
    color: '#6B7280', 
    textAlign: 'center', 
    marginVertical: 12 
  },
});

export default IntakesScreen;