import React, {useRef, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Animated,
  Dimensions,
  Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useFocusEffect} from '@react-navigation/native';
import {supabase} from '../lib/supabase';
import {FONTS, TEXT_COLORS} from '../lib/fonts';
import {markStreakDay, loadStreakDays, computeStreak} from '../lib/streak';

const WINDOW = Dimensions.get('window');
const SIDEBAR_WIDTH = WINDOW.width * 0.72;
const QOTD_STORAGE_KEY = 'qotdState';

const getLocalDateKey = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

const HomeScreen = ({navigation, onSignOut, user}) => {
  const [streak, setStreak] = useState(0);
  const [referralCode, setReferralCode] = useState(null);
  const [referralCount, setReferralCount] = useState(0);
  const [referralLoading, setReferralLoading] = useState(false);

  const loadReferral = useCallback(async () => {
    const userId = user?.user?.id;
    if (!userId) {return;}
    setReferralLoading(true);
    try {
      // Try to fetch existing code
      const {data: existing} = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', userId)
        .single();

      let code = existing?.code;
      if (!code) {
        // Generate a new 6-char code and store it
        code = Math.random().toString(36).substring(2, 8).toUpperCase();
        await supabase.from('referral_codes').insert({user_id: userId, code});
      }
      setReferralCode(code);

      // Count how many friends signed up using this code
      const {count} = await supabase
        .from('referral_events')
        .select('id', {count: 'exact', head: true})
        .eq('referrer_user_id', userId)
        .eq('event_type', 'signup');
      setReferralCount(count ?? 0);
    } catch (_) {}
    setReferralLoading(false);
  }, [user]);

  useFocusEffect(useCallback(() => {
    loadStreakDays().then(days => setStreak(computeStreak(days)));
    loadReferral();
  }, [loadReferral]));

  const handleShare = async () => {
    if (!referralCode) {return;}
    try {
      await Share.share({
        message: `Use my referral code ${referralCode} to sign up on XamBuddy and get 1 week of free premium! 🎉`,
      });
    } catch (_) {}
  };

  const [menuMounted, setMenuMounted] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const sidebarX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const sidebarOverlay = useRef(new Animated.Value(0)).current;
  const [qotdOpen, setQotdOpen] = useState(false);
  const [qotdQuestion, setQotdQuestion] = useState(null);
  const [qotdLoading, setQotdLoading] = useState(false);
  const [qotdAnswer, setQotdAnswer] = useState(null);
  const [qotdFeedback, setQotdFeedback] = useState(null);
  const [qotdError, setQotdError] = useState('');
  const [cardLayout, setCardLayout] = useState(null);
  const cardRef = useRef(null);

  const overlayLeft = useRef(new Animated.Value(0)).current;
  const overlayTop = useRef(new Animated.Value(0)).current;
  const overlayWidth = useRef(new Animated.Value(0)).current;
  const overlayHeight = useRef(new Animated.Value(0)).current;
  const overlayRadius = useRef(new Animated.Value(24)).current;
  const overlayDimmed = useRef(new Animated.Value(0)).current;

  const openMenu = () => {
    setMenuMounted(true);
    sidebarX.setValue(-SIDEBAR_WIDTH);
    sidebarOverlay.setValue(0);
    Animated.parallel([
      Animated.timing(sidebarX, {toValue: 0, duration: 280, useNativeDriver: true}),
      Animated.timing(sidebarOverlay, {toValue: 1, duration: 280, useNativeDriver: true}),
    ]).start();
  };

  const closeMenu = (callback) => {
    Animated.parallel([
      Animated.timing(sidebarX, {toValue: -SIDEBAR_WIDTH, duration: 240, useNativeDriver: true}),
      Animated.timing(sidebarOverlay, {toValue: 0, duration: 240, useNativeDriver: true}),
    ]).start(() => {
      setMenuMounted(false);
      callback?.();
    });
  };

  const handleLogoutPress = () => {
    closeMenu(() => setLogoutConfirmVisible(true));
  };

  const confirmLogout = () => {
    setLogoutConfirmVisible(false);
    onSignOut?.();
  };

  const resetQOTDState = () => {
    setQotdQuestion(null);
    setQotdAnswer(null);
    setQotdFeedback(null);
    setQotdError('');
  };

  const normalizeQOTDOptions = question => {
    if (!question) return {};
    const optionsData = question.options || {
      A: question.option_a,
      B: question.option_b,
      C: question.option_c,
      D: question.option_d,
    };
    return Object.fromEntries(
      Object.entries(optionsData)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [String(key).toUpperCase(), value]),
    );
  };

  const getQOTDCorrectKey = question => {
    if (!question) return null;
    const raw = String(question.correct_answer || '').trim();
    const upper = raw.toUpperCase();
    if (['A', 'B', 'C', 'D'].includes(upper)) return upper;

    const options = normalizeQOTDOptions(question);
    const matchingKey = Object.entries(options).find(([, value]) => {
      if (typeof value !== 'string') return false;
      return value.trim().toUpperCase() === raw.toUpperCase();
    });
    return matchingKey ? matchingKey[0] : null;
  };

  const normalizeQOTDQuestion = question => {
    if (!question) return question;
    const correctKey = getQOTDCorrectKey(question);
    if (!correctKey) return question;
    return {
      ...question,
      correct_answer: correctKey,
    };
  };

  const loadStoredQOTDState = async () => {
    try {
      const saved = await AsyncStorage.getItem(QOTD_STORAGE_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed?.date !== getLocalDateKey()) return null;
      return parsed;
    } catch (err) {
      console.warn('QOTD load error:', err);
      return null;
    }
  };

  const saveQOTDState = async state => {
    try {
      await AsyncStorage.setItem(QOTD_STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('QOTD save error:', err);
    }
  };

  const loadQOTDQuestion = async () => {
    setQotdLoading(true);
    setQotdError('');
    setQotdQuestion(null);
    try {
      const stored = await loadStoredQOTDState();
      if (stored?.question) {
        const normalizedStoredQuestion = normalizeQOTDQuestion(stored.question);
        setQotdQuestion(normalizedStoredQuestion);
        setQotdAnswer(stored.answer || null);
        setQotdFeedback(stored.feedback || null);
        return;
      }

      const {data, error} = await supabase
        .from('questions')
        .select('*')
        .eq('question_type', 'mcq')
        .eq('difficulty', 'easy')
        .limit(20);

      if (error || !data?.length) {
        setQotdError('Unable to load the Question of the Day.');
        setQotdQuestion(null);
      } else {
        const randomIndex = Math.floor(Math.random() * data.length);
        const question = normalizeQOTDQuestion(data[randomIndex]);
        setQotdQuestion(question);
        await saveQOTDState({
          date: getLocalDateKey(),
          question,
          answer: null,
          feedback: null,
        });
      }
    } catch (err) {
      console.error('QOTD fetch error:', err);
      setQotdError('Unable to load the Question of the Day.');
      setQotdQuestion(null);
    } finally {
      setQotdLoading(false);
    }
  };

  const openQOTD = () => {
    if (!cardRef.current) {
      return;
    }

    cardRef.current.measureInWindow((x, y, width, height) => {
      setCardLayout({x, y, width, height});
      overlayLeft.setValue(x);
      overlayTop.setValue(y);
      overlayWidth.setValue(width);
      overlayHeight.setValue(height);
      overlayRadius.setValue(24);
      overlayDimmed.setValue(0);
      setQotdOpen(true);
      setQotdLoading(true);
      setQotdError('');
      setQotdQuestion(null);
      loadQOTDQuestion();

      Animated.parallel([
        Animated.timing(overlayLeft, {
          toValue: 0,
          duration: 360,
          useNativeDriver: false,
        }),
        Animated.timing(overlayTop, {
          toValue: 0,
          duration: 360,
          useNativeDriver: false,
        }),
        Animated.timing(overlayWidth, {
          toValue: WINDOW.width,
          duration: 360,
          useNativeDriver: false,
        }),
        Animated.timing(overlayHeight, {
          toValue: WINDOW.height,
          duration: 360,
          useNativeDriver: false,
        }),
        Animated.timing(overlayRadius, {
          toValue: 0,
          duration: 360,
          useNativeDriver: false,
        }),
        Animated.timing(overlayDimmed, {
          toValue: 1,
          duration: 360,
          useNativeDriver: false,
        }),
      ]).start();
    });
  };

  const closeQOTD = () => {
    if (!cardLayout) {
      setQotdOpen(false);
      resetQOTDState();
      return;
    }

    Animated.parallel([
      Animated.timing(overlayLeft, {
        toValue: cardLayout.x,
        duration: 320,
        useNativeDriver: false,
      }),
      Animated.timing(overlayTop, {
        toValue: cardLayout.y,
        duration: 320,
        useNativeDriver: false,
      }),
      Animated.timing(overlayWidth, {
        toValue: cardLayout.width,
        duration: 320,
        useNativeDriver: false,
      }),
      Animated.timing(overlayHeight, {
        toValue: cardLayout.height,
        duration: 320,
        useNativeDriver: false,
      }),
      Animated.timing(overlayRadius, {
        toValue: 24,
        duration: 320,
        useNativeDriver: false,
      }),
      Animated.timing(overlayDimmed, {
        toValue: 0,
        duration: 320,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setQotdOpen(false);
      resetQOTDState();
    });
  };

  const handleAnswerSelect = async optionKey => {
    setQotdAnswer(optionKey);
    if (!qotdQuestion) return;

    const feedback = optionKey === qotdQuestion.correct_answer ? 'correct' : 'wrong';
    setQotdFeedback(feedback);

    await saveQOTDState({
      date: getLocalDateKey(),
      question: qotdQuestion,
      answer: optionKey,
      feedback,
    });

    await markStreakDay();
    loadStreakDays().then(days => setStreak(computeStreak(days)));
  };

  const renderQOTDOptions = () => {
    if (!qotdQuestion) return null;

    const optionsData = normalizeQOTDOptions(qotdQuestion);
    const optionKeys = Object.keys(optionsData).sort();

    if (optionKeys.length === 0) return null;

    return optionKeys.map(key => {
      const label = optionsData[key] || '';
      const selected = qotdAnswer === key;
      const correct = qotdQuestion.correct_answer === key;
      const optionStyle = [styles.optionButton];
      const labelStyle = [styles.optionLabel];

      if (qotdAnswer) {
        if (correct) {
          optionStyle.push(styles.optionCorrect);
          labelStyle.push(styles.optionLabelCorrect);
        } else if (selected && !correct) {
          optionStyle.push(styles.optionWrong);
          labelStyle.push(styles.optionLabelWrong);
        }
      }

      return (
        <TouchableOpacity
          key={key}
          onPress={() => handleAnswerSelect(key)}
          style={optionStyle}
          activeOpacity={0.85}
          disabled={!!qotdAnswer}>
          <View style={styles.optionBadge}>
            <Text style={styles.optionBadgeText}>{key}</Text>
          </View>
          <Text style={labelStyle}>{label}</Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={styles.container}>
      {menuMounted && (
        <View style={styles.sidebarContainer}>
          <TouchableWithoutFeedback onPress={() => closeMenu()}>
            <Animated.View style={[styles.overlay, {opacity: sidebarOverlay}]} />
          </TouchableWithoutFeedback>
          <Animated.View
            style={[styles.sidebar, {transform: [{translateX: sidebarX}]}]}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Menu</Text>
              <TouchableOpacity onPress={() => closeMenu()} style={styles.sidebarCloseBtn}>
                <Icon name="close" size={22} color="#1e4080" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.sidebarItem} onPress={() => closeMenu(() => navigation.navigate('Profile'))}>
              <Text style={styles.sidebarText}>Profile settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sidebarItem} onPress={() => closeMenu(() => navigation.navigate('Plans'))}>
              <Text style={styles.sidebarText}>Premium plans</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sidebarItem} onPress={() => closeMenu(() => navigation.navigate('Suggestions'))}>
              <Text style={styles.sidebarText}>Suggestions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sidebarItem} onPress={handleLogoutPress}>
              <Text style={styles.sidebarTextLogout}>Log out</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      <Modal
        visible={logoutConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutConfirmVisible(false)}>
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Are you sure you want to log out?</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setLogoutConfirmVisible(false)}>
                <Text style={styles.confirmButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonPrimary]}
                onPress={confirmLogout}>
                <Text style={[styles.confirmButtonText, styles.confirmButtonTextPrimary]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#1e4080', '#1e4080']}
          style={styles.topSection}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={openMenu} style={styles.hamburgerButton}>
              <Icon name="menu" size={26} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>XamBuddy</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.decorativeLine1} />
          <View style={styles.decorativeLine2} />
          <View style={styles.mintBlob} />

          <View style={styles.featuredCardOuter}>
            <TouchableOpacity
              ref={cardRef}
              activeOpacity={0.85}
              onPress={openQOTD}
              style={styles.featuredCardWrapper}
            >
              <LinearGradient
                colors={['#EBF4FF', '#EBF4FF', '#EBF4FF']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.featuredCard}
              >
                <Text style={styles.featuredCardTitle}>Question Of The Day!</Text>
                <Text style={styles.featuredCardSubtitle}>Tap to answer a fresh easy question.</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.whitePanelWrapper}>
            <LinearGradient
              colors={['#ffffff', '#ffffff']}
              start={{x: 0.5, y: 0}}
              end={{x: 0.5, y: 1}}
              style={styles.whitePanel}
            />
          </View>
        </LinearGradient>

        <LinearGradient
          colors={['#ffffff', '#EBF4FF']}
          style={styles.bottomSection}>
          <View style={styles.cardRow}>
            <TouchableOpacity
              style={styles.trackCard}
              onPress={() => navigation.navigate('Progress')}>
              <Text style={styles.trackCardTitle}>
                Track your{"\n"}progress
              </Text>
              <View style={styles.arrowContainer}>
                <Icon name="north_east" size={22} color="#4a5568" />
              </View>
            </TouchableOpacity>

            <View style={styles.streakCard}>
              <Text style={styles.streakLabel}>Streak</Text>
              <Text style={styles.streakNumber}>{streak}</Text>
            </View>
          </View>

          <View style={styles.referralCard}>
            <View style={styles.referralIconRow}>
              <View style={styles.referralIconBadge}>
                <Icon name="card-giftcard" size={22} color="#1e4080" />
              </View>
              <Text style={styles.referralHeading}>Refer a friend, earn free premium!</Text>
            </View>

            {referralLoading ? (
              <ActivityIndicator color="#1e4080" size="small" style={styles.referralSpinner} />
            ) : referralCode ? (
              <View style={styles.referralCodeRow}>
                <View style={styles.referralCodeBox}>
                  <Text style={styles.referralCodeText}>{referralCode}</Text>
                </View>
                <TouchableOpacity style={styles.referralShareBtn} onPress={handleShare}>
                  <Icon name="share" size={16} color="#ffffff" />
                  <Text style={styles.referralShareText}>Share</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {referralCount > 0 && (
              <Text style={styles.referralCountText}>
                {referralCount} friend{referralCount === 1 ? '' : 's'} joined using your code
              </Text>
            )}

            <View style={styles.referralRow}>
              <Icon name="person-add" size={18} color="#1e4080" />
              <Text style={styles.referralItem}>
                Friend downloads the app → <Text style={styles.referralHighlight}>1 week free premium</Text>
              </Text>
            </View>
            <View style={styles.referralRow}>
              <Icon name="star" size={18} color="#1e4080" />
              <Text style={styles.referralItem}>
                Friend subscribes to premium → <Text style={styles.referralHighlight}>1 month free premium</Text>
              </Text>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>

      {qotdOpen && (
        <Animated.View
          style={[
            styles.qotdOverlay,
            {
              left: overlayLeft,
              top: overlayTop,
              width: overlayWidth,
              height: overlayHeight,
              borderRadius: overlayRadius,
            },
          ]}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: 'rgba(0,0,0,0.28)',
                opacity: overlayDimmed,
              },
            ]}
          />
          <LinearGradient
            colors={['#ffffff', '#ebf4ff']}
            style={styles.qotdInner}
          >
            <View style={styles.qotdHeader}>
              <TouchableOpacity onPress={closeQOTD} style={styles.qotdBackButton}>
                <Icon name="arrow-back-ios" size={20} color="#2d3748" />
              </TouchableOpacity>
              <Text style={styles.qotdTitle}>Question of the Day</Text>
            </View>
            <ScrollView contentContainerStyle={styles.qotdContent} showsVerticalScrollIndicator={false}>
              {qotdLoading ? (
                <View style={styles.qotdLoading}>
                  <ActivityIndicator size="large" color="#1e4080" />
                  <Text style={styles.qotdLoadingText}>Loading question...</Text>
                </View>
              ) : qotdError ? (
                <View style={styles.qotdLoading}>
                  <Text style={styles.qotdError}>{qotdError}</Text>
                </View>
              ) : qotdQuestion ? (
                <>
                  <View style={styles.qotdQuestionCard}>
                    <Text style={styles.qotdQuestionText}>{qotdQuestion.question_text}</Text>
                  </View>
                  <View style={styles.qotdOptionsList}>{renderQOTDOptions()}</View>
                  {qotdFeedback ? (
                    <TouchableOpacity style={styles.qotdActionButton} onPress={closeQOTD} activeOpacity={0.85}>
                      <Text style={styles.qotdActionButtonText}>Back to home</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.qotdAssistText}>
                      Select one answer to see if it is right or wrong.
                    </Text>
                  )}
                </>
              ) : (
                <View style={styles.qotdLoading}>
                  <Text style={styles.qotdError}>Tap to try today's question.</Text>
                </View>
              )}
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF4FF',
  },
  topSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
    overflow: 'hidden',
  },
  decorativeLine1: {
    position: 'absolute',
    top: -80,
    left: -100,
    width: 500,
    height: 420,
    borderRadius: 210,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    transform: [{rotate: '-30deg'}],
    pointerEvents: 'none',
  },
  decorativeLine2: {
    position: 'absolute',
    top: -40,
    left: 50,
    width: 350,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    transform: [{rotate: '40deg'}],
    pointerEvents: 'none',
  },
  mintBlob: {
    position: 'absolute',
    bottom: -80,
    left: -40,
    width: 400,
    height: 350,
    borderRadius: 180,
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  },
  featuredCardOuter: {
    alignItems: 'center',
    marginBottom: -40,
    zIndex: 2,
  },
  featuredCardWrapper: {
    width: '85%',
    backgroundColor: '#EBF4FF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  featuredCard: {
    height: 180,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 28,
  },
  featuredCardTitle: {
    fontSize: 24,
    fontFamily: FONTS.heading,
    color: '#000000',
    textAlign: 'left',
    marginBottom: 10,
  },
  featuredCardSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: 'rgba(0,0,0,0.6)',
    textAlign: 'left',
    marginTop: 4,
  },
  whitePanelWrapper: {
    marginHorizontal: -20,
    marginTop: -50,
    height: 110,
    borderTopLeftRadius: 70,
    overflow: 'hidden',
    zIndex: 1,
  },
  whitePanel: {
    flex: 1,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 40,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  trackCard: {
    flex: 1.2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  trackCardTitle: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: TEXT_COLORS.title,
    lineHeight: 22,
  },
  streakCard: {
    flex: 0.8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  streakLabel: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: TEXT_COLORS.subtitle,
    marginBottom: 4,
  },
  streakNumber: {
    fontSize: 36,
    fontFamily: FONTS.headingBold,
    color: TEXT_COLORS.title,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingBottom: 18,
    zIndex: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.heading,
    color: '#ffffff',
  },
  headerSpacer: {
    width: 48,
  },
  hamburgerButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    flexDirection: 'row',
  },
  sidebar: {
    width: '72%',
    backgroundColor: '#EBF4FF',
    paddingTop: 60,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 0},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sidebarTitle: {
    fontSize: 24,
    fontFamily: FONTS.heading,
    color: '#1e4080',
  },
  sidebarCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(30,64,128,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#c7d9f0',
  },
  sidebarText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: '#1e4080',
  },
  sidebarTextLogout: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: '#e53e3e',
  },
  confirmOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  confirmBox: {
    width: '82%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  confirmTitle: {
    fontSize: 18,
    fontFamily: FONTS.heading,
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  confirmButtonPrimary: {
    backgroundColor: '#e53e3e',
  },
  confirmButtonText: {
    fontSize: 15,
    fontFamily: FONTS.body,
    color: '#111827',
  },
  confirmButtonTextPrimary: {
    color: '#ffffff',
  },
  referralCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  referralIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  referralIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  referralHeading: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.bodyBold,
    color: TEXT_COLORS.title,
    lineHeight: 20,
  },
  referralRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  referralItem: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.body,
    color: '#4a5568',
    lineHeight: 20,
  },
  referralHighlight: {
    fontFamily: FONTS.bodyBold,
    color: '#1e4080',
  },
  referralSpinner: {
    marginVertical: 12,
    alignSelf: 'flex-start',
  },
  referralCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  referralCodeBox: {
    flex: 1,
    backgroundColor: '#dde8ff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  referralCodeText: {
    fontSize: 20,
    fontFamily: FONTS.headingBold,
    color: '#1e4080',
    letterSpacing: 3,
  },
  referralShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1e4080',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  referralShareText: {
    fontSize: 14,
    fontFamily: FONTS.bodyBold,
    color: '#ffffff',
  },
  referralCountText: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: '#22c55e',
    marginBottom: 10,
  },
  arrowContainer: {
    marginLeft: 12,
  },
  qotdOverlay: {
    position: 'absolute',
    zIndex: 30,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  qotdInner: {
    flex: 1,
    overflow: 'hidden',
  },
  qotdHeader: {
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  qotdBackButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  qotdTitle: {
    fontSize: 20,
    fontFamily: FONTS.heading,
    color: '#2d3748',
  },
  qotdContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  qotdLoading: {
    minHeight: 320,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
  },
  qotdLoadingText: {
    marginTop: 18,
    fontSize: 15,
    fontFamily: FONTS.body,
    color: TEXT_COLORS.subtitle,
  },
  qotdError: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: '#d53f8c',
    textAlign: 'center',
  },
  qotdQuestionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 22,
    marginTop: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  qotdQuestionText: {
    fontSize: 18,
    fontFamily: FONTS.heading,
    color: TEXT_COLORS.title,
    lineHeight: 26,
  },
  qotdOptionsList: {
    marginBottom: 18,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#edf2f7',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  optionBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#dde8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionBadgeText: {
    fontSize: 16,
    fontFamily: FONTS.headingBold,
    color: '#2d3748',
  },
  optionLabel: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: TEXT_COLORS.title,
    flex: 1,
    lineHeight: 22,
  },
  optionCorrect: {
    borderColor: '#2f855a',
    backgroundColor: '#e6ffed',
  },
  optionWrong: {
    borderColor: '#c53030',
    backgroundColor: '#fff5f5',
  },
  optionLabelCorrect: {
    color: '#2f855a',
  },
  optionLabelWrong: {
    color: '#c53030',
  },
  qotdFeedbackBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  qotdFeedbackLabel: {
    fontSize: 16,
    fontFamily: FONTS.heading,
    color: '#2d3748',
    marginBottom: 6,
  },
  qotdFeedbackHint: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: TEXT_COLORS.subtitle,
    lineHeight: 20,
  },
  qotdActionButton: {
    marginTop: 18,
    backgroundColor: '#1e4080',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  qotdActionButtonText: {
    fontSize: 16,
    fontFamily: FONTS.heading,
    color: '#ffffff',
  },
  qotdAssistText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: TEXT_COLORS.subtitle,
    marginTop: 8,
  },
});

export default HomeScreen;
