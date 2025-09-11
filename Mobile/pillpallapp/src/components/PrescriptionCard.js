import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PrescriptionCard = ({ prescription, onEdit, onDelete }) => (
  <View style={styles.card}>
    <Icon name="medication" size={24} color="#1E40AF" style={styles.icon} />
    <View style={styles.info}>
      <Text style={styles.name}>{prescription.medicationName}</Text>
      <Text style={styles.detail}>Dosage: {prescription.dosage}</Text>
      <Text style={styles.detail}>Début: {prescription.startDate}</Text>
      <Text style={styles.detail}>Fin: {prescription.endDate}</Text>
    </View>
    <View style={styles.actions}>
      <TouchableOpacity onPress={() => onEdit(prescription)}>
        <Icon name="edit" size={20} color="#10B981" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(prescription.id)}>
        <Icon name="delete" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
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
  icon: { marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#1E40AF' },
  detail: { fontSize: 14, color: '#666666' },
  actions: { flexDirection: 'row', gap: 16 },
});

export default PrescriptionCard;