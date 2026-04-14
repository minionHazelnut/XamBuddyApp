import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const RioScreen = () => {
  return (
    <View style={styles.container}>
      <Icon name="auto_awesome" size={48} color="#a0aec0" />
      <Text style={styles.title}>Rio</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f2040',
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

export default RioScreen;
