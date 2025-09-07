import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const DoctorCard = ({ doctor, onEdit, onDelete, onAdd }) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.text}>{doctor.user.fullName}</Text>
        <Text style={styles.text}>{doctor.specialty?.name}</Text>
      </View>
      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity onPress={() => onEdit(doctor)}>
            <Text style={styles.edit}>Modifier</Text>
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity onPress={() => onDelete(doctor.id)}>
            <Text style={styles.delete}>Supprimer</Text>
          </TouchableOpacity>
        )}
        {onAdd && (
          <TouchableOpacity onPress={() => onAdd(doctor.id)}>
            <Text style={styles.add}>Ajouter</Text>
          </TouchableOpacity>
        )}
      </View>
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
    marginRight: 16,
  },
  add: {
    color: '#16A34A', // vert
  },
});

export default DoctorCard;
