import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PatientCard = ({ patient, onPress, onEdit, onDelete }) => {
  const hasActions = onEdit || onDelete;
  const Container = hasActions ? View : TouchableOpacity;
  const containerProps = hasActions ? {} : { onPress };

  return (
    <Container style={styles.container} {...containerProps}>
      <View style={styles.info}>
        <View style={styles.nameContainer}>
          <Icon name="person" size={20} color="#1E40AF" style={styles.userIcon} />
          <Text style={styles.name}>{patient.fullName || 'Nom inconnu'}</Text>
        </View>
        <Text style={styles.detail}>Email: {patient.email || 'N/A'}</Text>
        {patient.birthDate && (
          <Text style={styles.detail}>Date de naissance: {patient.birthDate}</Text>
        )}
        {patient.doctorNames && (
          <Text style={styles.detail}>Médecins: {patient.doctorNames}</Text>
        )}
        {patient.enabled !== undefined && (
          <Text style={styles.detail}>Statut: {patient.enabled ? 'Actif' : 'Inactif'}</Text>
        )}
      </View>
      {hasActions && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity onPress={() => onEdit(patient)}>
              <Icon name="edit" size={20} color="#1E40AF" style={styles.actionIcon} />
            </TouchableOpacity>
          )}
          
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: 8,
  },
  info: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userIcon: {
    marginRight: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  detail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  actionIcon: {
    marginLeft: 12,
  },
});

export default PatientCard;