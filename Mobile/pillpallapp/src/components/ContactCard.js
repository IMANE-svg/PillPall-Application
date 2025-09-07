import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ContactCard = ({ contact, onEdit, onDelete }) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.text}>{contact.name}</Text>
        <Text style={styles.text}>{contact.email}</Text>
        <Text style={styles.text}>{contact.phone}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onEdit(contact)}>
          <Text style={styles.edit}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(contact.id)}>
          <Text style={styles.delete}>Supprimer</Text>
        </TouchableOpacity>
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
    color: '#DC2626', // rouge
  },
});

export default ContactCard;
