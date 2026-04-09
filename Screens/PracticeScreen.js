import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MCQScreen from './MCQScreen';

const Stack = createNativeStackNavigator();

const PracticeHome = ({navigation}) => {
  const cards = [
    {title: 'Target Weak\nAreas', screen: null},
    {title: 'MCQ\nPractice', screen: 'MCQ'},
    {title: 'Short\nAnswers', screen: null},
    {title: 'Long\nAnswers', screen: null},
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Practice</Text>
        <View style={styles.backButton} />
      </View>
      <Text style={styles.subtitle}>Making Practice Fun</Text>

      {/* Cards Grid */}
      <View style={styles.grid}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => card.screen && navigation.navigate(card.screen)}>
            <Text style={styles.cardTitle}>{card.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const PracticeScreen = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="PracticeHome" component={PracticeHome} />
      <Stack.Screen name="MCQ" component={MCQScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
  },
  backArrow: {
    fontSize: 28,
    color: '#2d3748',
    fontWeight: '300',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#8a9a9a',
    marginBottom: 30,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 16,
    justifyContent: 'center',
  },
  card: {
    width: '45%',
    aspectRatio: 0.85,
    backgroundColor: '#e8f5ee',
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4a6a6a',
    lineHeight: 28,
  },
});

export default PracticeScreen;
