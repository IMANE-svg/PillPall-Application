import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Header = ({ title, onLogout, onHistory, showMenu = false }) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Image
          source={require('../assets/health-logo.png')} // 👈 Mets ton logo ici
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>{title || 'PillPall'}</Text>
      </View>
      {showMenu ? (
        <View style={styles.actions}>
          <TouchableOpacity onPress={onHistory} style={styles.iconButton}>
            <Icon name="history" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onLogout}>
            <Icon name="logout" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        onLogout && (
          <TouchableOpacity onPress={onLogout}>
            <Icon name="logout" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1E40AF', // bleu
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
  },
  iconButton: {
    marginRight: 16,
  },
});

export default Header;
