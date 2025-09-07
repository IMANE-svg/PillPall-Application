import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import Header from '../../components/Header';
import { getSpecialties, addSpecialty, updateSpecialty, deleteSpecialty } from '../../api/admin';
import { logout } from '../../utils/auth';

const ManageSpecialtiesScreen = ({ navigation }) => {
  const [specialties, setSpecialties] = useState([]);
  const [form, setForm] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getSpecialties().then((res) => setSpecialties(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async () => {
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
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l’opération');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSpecialty(id);
      setSpecialties(specialties.filter((s) => s.id !== id));
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la suppression');
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
        {(adding || editingId) ? (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Nom de la spécialité"
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
            />
            <TouchableOpacity style={styles.buttonGreen} onPress={handleSubmit}>
              <Text style={styles.buttonText}>{editingId ? 'Modifier' : 'Ajouter'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.buttonBlue} onPress={() => setAdding(true)}>
            <Text style={styles.buttonText}>Ajouter spécialité</Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={specialties}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text>{item.name}</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => {
                    setEditingId(item.id);
                    setForm({ name: item.name });
                  }}
                >
                  <Text style={[styles.actionText, styles.blueText]}>Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Text style={[styles.actionText, styles.redText]}>Supprimer</Text>
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
  buttonBlue: {
    backgroundColor: '#1E40AF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonGreen: {
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  actions: {
    flexDirection: 'row',
  },
  actionText: {
    fontSize: 16,
    marginLeft: 8,
    marginRight: 8,
  },
  blueText: {
    color: '#1E40AF',
  },
  redText: {
    color: '#EF4444',
  },
});

export default ManageSpecialtiesScreen;
