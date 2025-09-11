import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import Header from '../../components/Header';
import { getSpecialties, addSpecialty, updateSpecialty, deleteSpecialty } from '../../api/admin';
import { logout } from '../../utils/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ManageSpecialtiesScreen = ({ navigation }) => {
  const [specialties, setSpecialties] = useState([]);
  const [form, setForm] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getSpecialties()
      .then((res) => setSpecialties(res.data))
      .catch(() => Alert.alert('Erreur', 'Impossible de charger les spécialités'));
  }, []);

  const handleSubmit = async () => {
    if (!form.name) {
      Alert.alert('Erreur', 'Veuillez entrer un nom de spécialité');
      return;
    }
    try {
      if (editingId) {
        await updateSpecialty(editingId, form);
        setSpecialties(specialties.map((s) => (s.id === editingId ? { ...s, ...form } : s)));
      } else {
        const res = await addSpecialty(form);
        setSpecialties([...specialties, { id: res.data, ...form }]);
      }
      setForm({ name: '' });
      setEditingId(null);
      setAdding(false);
      Alert.alert('Succès', editingId ? 'Spécialité modifiée' : 'Spécialité ajoutée');
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l’opération');
    }
  };

  

  return (
    <View style={styles.container}>
      <Header
        title="Gestion des spécialités"
        onLogout={() => {
          logout();
          navigation.replace('Login');
        }}
      />
      <View style={styles.content}>
        {(adding || editingId) ? (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nom de la spécialité"
              placeholderTextColor="#666666"
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Icon name="save" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>{editingId ? 'Modifier' : 'Ajouter'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setAdding(true);
              setEditingId(null);
              setForm({ name: '' });
            }}
          >
            <Icon name="add" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Ajouter spécialité</Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={specialties}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.rowText}>{item.name}</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => {
                    setEditingId(item.id);
                    setAdding(false);
                    setForm({ name: item.name });
                  }}
                >
                  <Icon name="edit" size= {20} color="#1E40AF" />
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
  form: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F0F4F8',
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1E40AF',
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E40AF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: 8,
  },
  rowText: {
    fontSize: 16,
    color: '#1E40AF',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
  },
  actionIcon: {
    marginLeft: 12,
  },
});

export default ManageSpecialtiesScreen;