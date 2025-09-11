import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, TextInput, Switch } from 'react-native';
import Header from '../../components/Header';
import { updateUserStatus, deleteUser } from '../../api/admin';
import { logout } from '../../utils/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { getAuthHeaders } from '../../api/auth';

const API_URL = 'http://192.168.1.11:8080/api/admin';

const ManageRightsScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const headers = await getAuthHeaders();
        console.log('Fetching users with headers:', headers);
        const response = await axios.get(`${API_URL}/users`, { headers });
        console.log('Users response:', response.data);
        const validUsers = (response.data || []).filter(user => user && user.id != null);
        setUsers(validUsers);
        setError(null);
      } catch (error) {
        const message = error.response ? `Status ${error.response.status}: ${JSON.stringify(error.response.data)}` : error.message;
        console.error('Fetch error:', message);
        setError(message);
        Alert.alert('Erreur', message);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => user.fullName.toLowerCase().includes(search.toLowerCase()));

  const handleToggleStatus = async (user) => {
    try {
      await updateUserStatus(user.id, !user.enabled);
      setUsers(users.map(u => u.id === user.id ? { ...u, enabled: !u.enabled } : u));
      Alert.alert('Succès', `Utilisateur ${user.enabled ? 'désactivé' : 'activé'}`);
      setError(null);
    } catch (error) {
      setError(error.message);
      Alert.alert('Erreur', error.message);
    }
  };

  

  return (
    <View style={styles.container}>
      <Header title="Gestion des droits" onLogout={() => { logout(); navigation.replace('Login'); }} />
      <View style={styles.content}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#1E40AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Chercher utilisateur par nom"
            placeholderTextColor="#666666"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.info}>
                <View style={styles.nameContainer}>
                  <Icon name="person" size={20} color="#1E40AF" style={styles.userIcon} />
                  <Text style={styles.name}>{item.fullName || 'Nom inconnu'}</Text>
                </View>
                <Text style={styles.detail}>Email: {item.email || 'N/A'}</Text>
                <Text style={styles.detail}>Rôle: {item.roles?.join(', ') || 'Aucun'}</Text>
                <Text style={styles.detail}>Statut: {item.enabled ? 'Actif' : 'Inactif'}</Text>
              </View>
              <View style={styles.actions}>
                <Switch
                  trackColor={{ false: '#EF4444', true: '#10B981' }}
                  thumbColor={item.enabled ? '#FFFFFF' : '#FFFFFF'}
                  value={item.enabled}
                  onValueChange={() => handleToggleStatus(item)}
                />
                
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#1E40AF', borderRadius: 8, marginBottom: 16 },
  searchIcon: { marginLeft: 8 },
  searchInput: { flex: 1, padding: 10, fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#F8F8F8', borderRadius: 8, marginBottom: 8 },
  info: { flex: 1 },
  nameContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  userIcon: { marginRight: 8 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1E40AF' },
  detail: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionIcon: { marginLeft: 12 },
  emptyText: { textAlign: 'center', color: '#6B7280', fontSize: 16, marginTop: 20 },
  errorText: { color: '#EF4444', textAlign: 'center', fontSize: 16, marginBottom: 16 },
});

export default ManageRightsScreen;