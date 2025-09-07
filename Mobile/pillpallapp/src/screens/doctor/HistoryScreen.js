import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Header from '../../components/Header';
import { getHistory } from '../../api/doctor';
import { logout } from '../../utils/auth';

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getHistory().then((res) => setHistory(res.data)).catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title="PillPall"
        onLogout={() => {
          logout();
          navigation.replace('Login');
        }}
        onHistory={() => {}}
        showMenu
      />
      <View style={styles.content}>
        <Text style={styles.title}>Historique des prescriptions</Text>
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text>Patient: {item.patient.user.fullName}</Text>
              <Text>Médicament: {item.medicationName}</Text>
              <Text>Date début: {item.startDate}</Text>
              <Text>Date fin: {item.endDate}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1E40AF', marginBottom: 16 },
  card: { padding: 8, borderBottomWidth: 1, borderBottomColor: '#ccc' },
});

export default HistoryScreen;
