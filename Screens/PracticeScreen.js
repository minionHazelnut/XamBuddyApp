import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PracticeScreen = () => {
  return (
    <View style={styles.container}>
      <Icon name="assignment" size={48} color="#a0aec0" />
      <Text style={styles.title}>Practice Tests</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
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
});

export default PracticeScreen;
