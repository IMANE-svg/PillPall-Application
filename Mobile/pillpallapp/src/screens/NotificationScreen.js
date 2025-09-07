import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { confirmIntake } from '../api/patient';

const NotificationScreen = ({ route, navigation }) => {
  const { intakeId, medicationName } = route.params;

  const handleConfirm = async () => {
    try {
      await confirmIntake(intakeId);
      navigation.navigate('Patient', { screen: 'Prises' });
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la confirmation');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        C'est l'heure de prendre {medicationName} !
      </Text>
      <Icon name="access-time" size={100} color="#007AFF" />
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
