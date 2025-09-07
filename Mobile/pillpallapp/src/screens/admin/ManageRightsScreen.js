import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import Header from '../../components/Header';
import { updateUserStatus, getDoctors, getPatientsByDoctor } from '../../api/admin';
import { logout } from '../../utils/auth';

const ManageRightsScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Simuler récupération des utilisateurs (doctors + patients)
    Promise.all([
      getDoctors().then((res) => res.data.map((d) => ({ ...d.user, role: 'DOCTOR' }))),
      getPatientsByDoctor('').then((res) => res.data.map((p) => ({ ...p.user, role: 'PATIENT' }))),
    ])
      .then(([doctors, patients]) => {
        const allUsers = [...doctors, ...patients].sort((a, b) => a.fullName.localeCompare(b.fullName));
        setUsers(allUsers);
      })
      .catch(() => {});
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = async (id, enabled) => {
    try {
      await updateUserStatus(id, enabled);
      setUsers(users.map((u) => (u.id === id ? { ...u, enabled } : u)));
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la mise à jour');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="PillPall"
        onLogout={() => {
          logout();
          navigation.replace('Login');
        }}
      />
      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="Rechercher par nom ou email"
          value={search}
          onChangeText={setSearch}
        />
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.userRow}>
              <View>
                <Text style={styles.userText}>{item.fullName}</Text>
                <Text style={styles.userText}>{item.email}</Text>
                <Text style={styles.userText}>Rôle: {item.role}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleToggleStatus(item.id, true)}>
                  <Text style={[styles.actionText, styles.enable]}>Activer</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleToggleStatus(item.id, false)}>
                  <Text style={[styles.actionText, styles.disable]}>Désactiver</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1E40AF',
    padding: 8,
    marginBottom: 16,
    borderRadius: 8,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  userText: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    marginLeft: 8,
    marginRight: 8,
  },
  enable: {
    color: '#10B981',
  },
  disable: {
    color: '#EF4444',
  },
});

export default ManageRightsScreen;
