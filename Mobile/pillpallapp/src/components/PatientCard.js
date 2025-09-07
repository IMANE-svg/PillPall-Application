import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PatientCard = ({ patient, onEdit }) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.text}>{patient.user.fullName}</Text>
        <Text style={styles.text}>{patient.user.email}</Text>
        <Text style={styles.text}>Date de naissance: {patient.birthDate}</Text>
      </View>
      {onEdit && (
        <TouchableOpacity onPress={() => onEdit(patient)}>
          <Text style={styles.edit}>Modifier</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  text: {
    color: '#6B7280', // gris
  },
  edit: {
    color: '#1E40AF', // bleu
  },
});

export default PatientCard;
