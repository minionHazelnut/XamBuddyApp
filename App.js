import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from './Screens/HomeScreen';
import QBankScreen from './Screens/QBankScreen';
import PracticeScreen from './Screens/PracticeScreen';
import RioScreen from './Screens/RioScreen';
import ProfileScreen from './Screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a3a3a" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = 'home';
              } else if (route.name === 'QBank') {
                iconName = 'book';
              } else if (route.name === 'Practice') {
                iconName = 'assignment';
              } else if (route.name === 'Rio') {
                iconName = 'auto-awesome';
              } else if (route.name === 'Profile') {
                iconName = 'person';
              }

              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#ffffff',
            tabBarInactiveTintColor: '#a0aec0',
            tabBarStyle: {
              backgroundColor: '#1a3a3a',
              borderTopColor: '#2d5a5a',
              borderTopWidth: 1,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
            headerStyle: {
              backgroundColor: '#1a3a3a',
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen}
            options={{
              headerTitle: 'XamBuddy',
              tabBarLabel: 'Home',
              headerLeft: () => (
                <Icon name="menu" size={24} color="#ffffff" style={{ marginLeft: 16 }} />
              ),
              headerRight: () => <View style={{ width: 40 }} />,
            }}
          />
          <Tab.Screen 
            name="QBank" 
            component={QBankScreen}
            options={{ headerShown: false }}
          />
          <Tab.Screen 
            name="Practice" 
            component={PracticeScreen}
            options={{ headerShown: false }}
          />
          <Tab.Screen 
            name="Rio" 
            component={RioScreen}
            options={{ headerShown: false }}
          />
          <Tab.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
        </Tab.Navigator>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a3a3a',
  },
});

