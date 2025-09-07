import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PrescriptionCard = ({ prescription, onEdit, onDelete }) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.text}>{prescription.medicationName}</Text>
        <Text style={styles.text}>Dosage: {prescription.dosage}</Text>
        <Text style={styles.text}>Début: {prescription.startDate}</Text>
        <Text style={styles.text}>Fin: {prescription.endDate}</Text>
      </View>
      {onEdit && onDelete && (
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit(prescription)}>
            <Text style={styles.edit}>Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(prescription.id)}>
            <Text style={styles.delete}>Supprimer</Text>
          </TouchableOpacity>
        </View>
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
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
  },
  edit: {
    color: '#1E40AF',
    marginRight: 16,
  },
  delete: {
    color: '#DC2626',
  },
});

export default PrescriptionCard;
