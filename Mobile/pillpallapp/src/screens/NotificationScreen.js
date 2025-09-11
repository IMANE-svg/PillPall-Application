import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { confirmIntake } from '../api/patient';

const NotificationScreen = ({ route, navigation }) => {
  const { intakeId, medication } = route.params || {};

  const handleConfirm = async () => {
    console.log('Confirming intakeId:', intakeId, 'medication:', medication);
    if (!intakeId) {
      Alert.alert('Erreur', 'ID de prise manquant');
      return;
    }
    try {
      await confirmIntake(intakeId);
      console.log('Intake confirmed, navigating to IntakesScreen');
      navigation.navigate('Patient', { 
        screen: 'Prises',
        params: { confirmedIntake: { intakeId, confirmedAt: new Date().toISOString() } }
      });
    } catch (error) {
      console.error('Erreur confirmation:', error.response?.data || error.message);
      Alert.alert('Erreur', 'Échec de la confirmation');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        C'est l'heure de prendre {medication || 'votre médicament'} !
      </Text>
      <Icon name="access-time" size={100} color="#1E40AF" />
      <TouchableOpacity style={styles.button} onPress={handleConfirm}>
        <Text style={styles.buttonText}>Pris</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#22C55E',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default NotificationScreen;