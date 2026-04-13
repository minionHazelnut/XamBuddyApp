import React, {useRef, useState} from 'react';
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
  TextInput,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FONTS} from './lib/fonts';
import {supabase} from './lib/supabase';

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

const BOARD_OPTIONS = ['cbse', 'karnataka pu', 'other'];
const CLASS_OPTIONS = ['10th', '12th', 'other'];

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopColor: '#e8e8e8',
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
    fontSize: 14,
    fontFamily: FONTS.body,
    marginTop: 6,
  },
});

function AuthScreen({onSignIn}) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [stage, setStage] = useState('enterCredentials');
  const [selectedBoard, setSelectedBoard] = useState(BOARD_OPTIONS[0]);
  const [selectedClass, setSelectedClass] = useState(CLASS_OPTIONS[0]);
  const [boardOpen, setBoardOpen] = useState(false);
  const [gradeOpen, setGradeOpen] = useState(false);
  const [message, setMessage] = useState('Enter your email and password to continue.');
  const [supabaseUser, setSupabaseUser] = useState(null);

  const authAction = async () => {
    if (!email.trim() || !password.trim()) {
      setMessage('Email and password are required.');
      return;
    }

    if (mode === 'signup') {
      if (!confirmPassword.trim()) {
        setMessage('Please confirm your password.');
        return;
      }
      if (password.trim() !== confirmPassword.trim()) {
        setMessage('Passwords do not match.');
        return;
      }
    }

    setMessage(mode === 'signin' ? 'Signing in...' : 'Creating account...');

    let result;
    if (mode === 'signin') {
      result = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (result.error) {
        setMessage(result.error.message || 'Authentication failed.');
        return;
      }

      setSupabaseUser(result.data?.user ?? result.data?.session?.user ?? null);
      setStage('chooseBoard');
      setMessage('Signed in. Choose your board.');
      return;
    }

    result = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });

    if (result.error) {
      setMessage(result.error.message || 'Signup failed.');
      return;
    }

    const createdUser = result.data?.user ?? result.data?.session?.user;
    setSupabaseUser(createdUser ?? {email: email.trim().toLowerCase(), pending: true});
    setStage('chooseBoard');
    setMessage(
      createdUser
        ? 'Account created. Choose your board.'
        : 'Account created. Choose your board and verify your email if required.',
    );
  };

  const toggleMode = () => {
    const nextMode = mode === 'signin' ? 'signup' : 'signin';
    setMode(nextMode);
    setStage('enterCredentials');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setSelectedBoard(BOARD_OPTIONS[0]);
    setSelectedClass(CLASS_OPTIONS[0]);
    setSupabaseUser(null);
    setBoardOpen(false);
    setGradeOpen(false);
    setMessage(nextMode === 'signin' ? 'Enter your email and password to sign in.' : 'Enter your email and password to sign up.');
  };

  const finish = () => {
    if (!selectedBoard || !selectedClass) {
      setMessage('Please select a board and a class.');
      return;
    }
    onSignIn({
      email: email.trim().toLowerCase(),
      board: selectedBoard,
      studentClass: selectedClass,
      user: supabaseUser,
    });
  };

  return (
    <ScrollView contentContainerStyle={authStyles.container} keyboardShouldPersistTaps="handled">
      <Text style={authStyles.title}>
        XamBuddy {mode === 'signin' ? 'Sign In' : 'Sign Up'}
      </Text>
      <Text style={authStyles.subtitle}>
        {mode === 'signin'
          ? 'Sign in with email and password.'
          : 'Sign up with email and password.'}
      </Text>

      {stage === 'enterCredentials' && (
        <View style={authStyles.block}>
          <Text style={authStyles.label}>Email</Text>
          <TextInput
            style={authStyles.input}
            keyboardType="email-address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
          />
          <Text style={[authStyles.label, {marginTop: 16}]}>Password</Text>
          <TextInput
            style={authStyles.input}
            secureTextEntry
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
          />
          {mode === 'signup' && (
            <>
              <Text style={[authStyles.label, {marginTop: 16}]}>Confirm password</Text>
              <TextInput
                style={authStyles.input}
                secureTextEntry
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
              />
            </>
          )}
          <TouchableOpacity style={authStyles.button} onPress={authAction}>
            <Text style={authStyles.buttonText}>
              {mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={authStyles.textButton} onPress={toggleMode}>
            <Text style={authStyles.textButtonText}>
              {mode === 'signin'
                ? "Don't have an account yet? Sign up"
                : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {stage === 'chooseBoard' && (
        <View style={authStyles.block}>
          <Text style={authStyles.label}>Choose board</Text>
          <TouchableOpacity
            style={authStyles.dropdown}
            onPress={() => setBoardOpen(!boardOpen)}>
            <Text style={authStyles.dropdownText}>{selectedBoard.toUpperCase()}</Text>
          </TouchableOpacity>
          {boardOpen && (
            <View style={authStyles.dropdownMenu}>
              {BOARD_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option}
                  style={authStyles.dropdownItem}
                  onPress={() => {
                    setSelectedBoard(option);
                    setBoardOpen(false);
                  }}>
                  <Text style={authStyles.dropdownItemText}>{option.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TouchableOpacity
            style={authStyles.button}
            onPress={() => {
              if (!selectedBoard) {
                setMessage('Please choose a board.');
                return;
              }
              setStage('chooseGrade');
              setMessage('Now choose your grade.');
            }}>
            <Text style={authStyles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}

      {stage === 'chooseGrade' && (
        <View style={authStyles.block}>
          <Text style={authStyles.label}>Choose grade</Text>
          <TouchableOpacity
            style={authStyles.dropdown}
            onPress={() => setGradeOpen(!gradeOpen)}>
            <Text style={authStyles.dropdownText}>{selectedClass.toUpperCase()}</Text>
          </TouchableOpacity>
          {gradeOpen && (
            <View style={authStyles.dropdownMenu}>
              {CLASS_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option}
                  style={authStyles.dropdownItem}
                  onPress={() => {
                    setSelectedClass(option);
                    setGradeOpen(false);
                  }}>
                  <Text style={authStyles.dropdownItemText}>{option.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TouchableOpacity style={authStyles.button} onPress={finish}>
            <Text style={authStyles.buttonText}>Continue to Home</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={authStyles.message}>{message}</Text>
    </ScrollView>
  );
}

const authStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#6b7c7c',
  },
  title: {
    fontSize: 30,
    fontFamily: FONTS.heading,
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 24,
    lineHeight: 22,
  },
  block: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 10,
    fontFamily: FONTS.body,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    fontFamily: FONTS.body,
  },
  button: {
    backgroundColor: '#2d5a5a',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: FONTS.heading,
  },
  option: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#f8fafc',
  },
  selectedOption: {
    borderWidth: 1,
    borderColor: '#2d5a5a',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#e2f0ef',
  },
  optionText: {
    fontSize: 15,
    color: '#334155',
    fontFamily: FONTS.body,
  },
  optionTextActive: {
    fontSize: 15,
    color: '#0f172a',
    fontFamily: FONTS.heading,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
  },
  dropdownText: {
    fontSize: 15,
    color: '#334155',
    fontFamily: FONTS.body,
  },
  dropdownMenu: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#334155',
    fontFamily: FONTS.body,
  },
  textButton: {
    alignItems: 'center',
    marginTop: 12,
  },
  textButtonText: {
    color: '#2d5a5a',
    fontSize: 14,
    fontFamily: FONTS.body,
  },
  message: {
    marginTop: 12,
    color: '#f8fafc',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: FONTS.body,
  },
});

export default function App() {
  const [user, setUser] = useState(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <NavigationContainer>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#6b7c7c" />
        {user ? (
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
                fontFamily: FONTS.heading,
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
            <Tab.Screen name="Profile" options={{headerShown: false}}>
              {props => (
                <ProfileScreen
                  {...props}
                  user={user}
                  onSignOut={handleSignOut}
                />
              )}
            </Tab.Screen>
          </Tab.Navigator>
        ) : (
          <AuthScreen onSignIn={setUser} />
        )}
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
