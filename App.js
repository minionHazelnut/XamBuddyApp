import React, {useRef} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  StyleSheet,
  View,
  StatusBar,
  Animated,
  TouchableOpacity,
  Dimensions,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from './Screens/HomeScreen';
import QBankScreen from './Screens/QBankScreen';
import PracticeScreen from './Screens/PracticeScreen';
import RioScreen from './Screens/RioScreen';
import ProfileScreen from './Screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: 'home',
  QBank: 'book',
  Practice: 'assignment',
  Rio: 'auto-awesome',
  Profile: 'person',
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const TAB_COUNT = 5;
const TAB_WIDTH = SCREEN_WIDTH / TAB_COUNT;

const CustomTabBar = ({state, descriptors, navigation}) => {
  const circleX = useRef(new Animated.Value(state.index * TAB_WIDTH)).current;
  const prevIndex = useRef(state.index);

  if (prevIndex.current !== state.index) {
    prevIndex.current = state.index;

    Animated.spring(circleX, {
      toValue: state.index * TAB_WIDTH,
      useNativeDriver: true,
      damping: 10,
      stiffness: 70,
      mass: 1,
    }).start();
  }

  const circleTranslateX = circleX.interpolate({
    inputRange: [0, SCREEN_WIDTH],
    outputRange: [
      (TAB_WIDTH - 56) / 2,
      SCREEN_WIDTH + (TAB_WIDTH - 56) / 2,
    ],
  });

  return (
    <View style={tabStyles.container}>
      {/* Sliding circle */}
      <Animated.View
        style={[
          tabStyles.circle,
          {
            transform: [
              {translateX: circleTranslateX},
              {translateY: -14},
            ],
          },
        ]}
      />

      {/* Tab items */}
      {state.routes.map((route, index) => {
        const iconName = TAB_ICONS[route.name];
        const label =
          descriptors[route.key].options.tabBarLabel || route.name;
        const isFocused = state.index === index;

        // Animate icon based on circle proximity
        const tabCenter = index * TAB_WIDTH;
        const iconScale = circleX.interpolate({
          inputRange: [
            tabCenter - TAB_WIDTH,
            tabCenter,
            tabCenter + TAB_WIDTH,
          ],
          outputRange: [1, 1.4, 1],
          extrapolate: 'clamp',
        });
        const iconTranslateY = circleX.interpolate({
          inputRange: [
            tabCenter - TAB_WIDTH,
            tabCenter,
            tabCenter + TAB_WIDTH,
          ],
          outputRange: [0, -13, 0],
          extrapolate: 'clamp',
        });

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={tabStyles.tab}
            activeOpacity={0.7}>
            <View style={tabStyles.iconArea}>
              <Animated.View
                style={[
                  tabStyles.iconContainer,
                  {
                    transform: [
                      {scale: iconScale},
                      {translateY: iconTranslateY},
                    ],
                  },
                ]}>
                <Icon
                  name={iconName}
                  size={24}
                  color={isFocused ? '#ffffff' : '#8a9a9a'}
                />
              </Animated.View>
            </View>
            <Text
              style={[
                tabStyles.label,
                {color: isFocused ? '#2d3748' : '#8a9a9a'},
              ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#e8ebe9',
    borderTopColor: '#d0d4d2',
    borderTopWidth: 1,
    paddingBottom: 20,
    paddingTop: 10,
  },
  circle: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2d5a5a',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  iconArea: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
});

export default function App() {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#6b7c7c" />
        <Tab.Navigator
          tabBar={props => <CustomTabBar {...props} />}
          screenOptions={{
            headerStyle: {
              backgroundColor: '#6b7c7c',
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 22,
              color: '#ffffff',
            },
          }}>
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerTitle: 'XamBuddy',
              tabBarLabel: 'Home',
              headerLeft: () => (
                <View
                  style={{marginLeft: 16, justifyContent: 'center', gap: 5}}>
                  <View
                    style={{
                      width: 24,
                      height: 2.5,
                      backgroundColor: '#ffffff',
                      borderRadius: 2,
                    }}
                  />
                  <View
                    style={{
                      width: 16,
                      height: 2.5,
                      backgroundColor: '#ffffff',
                      borderRadius: 2,
                    }}
                  />
                  <View
                    style={{
                      width: 24,
                      height: 2.5,
                      backgroundColor: '#ffffff',
                      borderRadius: 2,
                    }}
                  />
                </View>
              ),
              headerRight: () => <View style={{width: 40}} />,
            }}
          />
          <Tab.Screen
            name="QBank"
            component={QBankScreen}
            options={{headerShown: false}}
          />
          <Tab.Screen
            name="Practice"
            component={PracticeScreen}
            options={{headerShown: false}}
          />
          <Tab.Screen
            name="Rio"
            component={RioScreen}
            options={{headerShown: false}}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{headerShown: false}}
          />
        </Tab.Navigator>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6b7c7c',
  },
});
