import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DoctorCard = ({ doctor, onEdit, onDelete, onAdd }) => {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.text}>{doctor.fullName}</Text>
        <Text style={styles.subText}>{doctor.specialty?.name || 'Non spécifié'}</Text>
      </View>
      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity onPress={() => onEdit(doctor)}>
            <Icon name="edit" size={20} color="#1E40AF" style={styles.actionIcon} />
          </TouchableOpacity>
        )}
        
        {onAdd && (
          <TouchableOpacity onPress={() => onAdd(doctor.id)}>
            <Icon name="add" size={20} color="#16A34A" style={styles.actionIcon} />
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
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: 8,
  },
  info: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  subText: {
    fontSize: 14,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
  },
  actionIcon: {
    marginLeft: 12,
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
    color: '#16A34A',
  },
});

export default DoctorCard;