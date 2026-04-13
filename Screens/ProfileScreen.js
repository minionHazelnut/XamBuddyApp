import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = ({user, onSignOut}) => {
  return (
    <View style={styles.container}>
      <Icon name="person" size={48} color="#a0aec0" />
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>{user?.email ?? 'No user signed in'}</Text>
      <TouchableOpacity style={styles.button} onPress={onSignOut}>
        <Text style={styles.buttonText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 12,
  },
  subtitle: {
    color: '#a0aec0',
    fontSize: 14,
    marginTop: 6,
  },
  button: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#2d5a5a',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
