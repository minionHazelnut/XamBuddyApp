import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FONTS} from '../lib/fonts';
import {loadStreakDays, computeStreak, getLocalDateKey} from '../lib/streak';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const SUBJECTS = [
  {name: 'Physics', pct: 68, color: '#1e4080'},
  {name: 'Maths', pct: 45, color: '#ef4444'},
  {name: 'Chemistry', pct: 81, color: '#22c55e'},
  {name: 'English', pct: 92, color: '#3b82f6'},
];

const ProfileScreen = ({user, onSignOut}) => {
  const displayName = user?.name || '';
  const initials = displayName
    ? displayName.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const boardLabel = user?.board ? user.board.toUpperCase() : 'CBSE';
  const classLabel = user?.studentClass ? `Class ${user.studentClass}` : 'Class --';

  const [stats, setStats] = useState(null);

  useFocusEffect(useCallback(() => {
    const loadStats = async () => {
      try {
        const [historyStr, countStr] = await Promise.all([
          AsyncStorage.getItem('quizProgressHistory'),
          AsyncStorage.getItem('quizTestsCount'),
        ]);
        const history = historyStr ? JSON.parse(historyStr) : [];
        const testsTaken = countStr ? parseInt(countStr, 10) : 0;
        let totalCorrect = 0;
        let totalAttempted = 0;
        history.forEach(entry => {
          totalCorrect += entry.correct || 0;
          totalAttempted += entry.attempted || 0;
        });
        const avgAccuracy =
          totalAttempted > 0
            ? Math.round((totalCorrect / totalAttempted) * 100)
            : 0;

        // Weak areas: unique chapters where accuracy was below 60% in any session
        const weakChapters = new Set();
        const subjectWeakCount = {};
        history.forEach(entry => {
          if ((entry.accuracy ?? 100) < 60 && entry.chapter) {
            weakChapters.add(entry.chapter);
            const subj = entry.subject || '';
            subjectWeakCount[subj] = (subjectWeakCount[subj] || 0) + 1;
          }
        });
        const weakAreasCount = weakChapters.size;
        const topWeakSubject =
          Object.keys(subjectWeakCount).sort(
            (a, b) => subjectWeakCount[b] - subjectWeakCount[a],
          )[0] || null;

        // Streak
        const streakDays = await loadStreakDays();
        const streakCount = computeStreak(streakDays);
        const streakSet = new Set(streakDays);

        // This week's dots (Mon–Sun)
        const todayD = new Date();
        todayD.setHours(12, 0, 0, 0);
        const dow = todayD.getDay();
        const monday = new Date(todayD);
        monday.setDate(todayD.getDate() - ((dow + 6) % 7));
        const weekChecked = Array.from({length: 7}, (_, i) => {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          return streakSet.has(getLocalDateKey(d));
        });

        setStats({avgAccuracy, totalQs: totalAttempted, testsTaken, weakAreasCount, topWeakSubject, streakCount, weekChecked});
      } catch (e) {}
    };
    loadStats();
  }, []));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{displayName || 'Student'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          <Text style={styles.meta}>{classLabel} · {boardLabel} · Free plan</Text>
        </View>

        {/* My Progress */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>MY PROGRESS</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {stats ? `${stats.avgAccuracy}%` : '--'}
              </Text>
              <Text style={styles.statLabel}>Avg accuracy</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {stats ? stats.totalQs : '--'}
              </Text>
              <Text style={styles.statLabel}>Qs answered</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {stats ? stats.testsTaken : '--'}
              </Text>
              <Text style={styles.statLabel}>Tests taken</Text>
            </View>
          </View>
        </View>

        {/* Weak Areas Card */}
        <View style={styles.whiteCard}>
          <View style={styles.infoIconWrap}>
            <Icon name="info" size={18} color="#ffffff" />
          </View>
          <View style={styles.weakAreaContent}>
            <Text style={styles.weakAreaTitle}>
              {stats && stats.weakAreasCount > 0
                ? `We found ${stats.weakAreasCount} weak area${stats.weakAreasCount === 1 ? '' : 's'} in your prep`
                : 'No weak areas found yet'}
            </Text>
            <Text style={styles.weakAreaSub}>
              {stats && stats.weakAreasCount > 0
                ? `${stats.topWeakSubject ? `${stats.topWeakSubject} chapters` : 'Chapters'} where you're losing marks — identified from your ${stats.testsTaken} test${stats.testsTaken === 1 ? '' : 's'}.`
                : 'Complete more quizzes to see where you need to improve.'}
            </Text>
            {stats && stats.weakAreasCount > 0 && (
              <Text style={styles.weakAreaLink}>
                See all {stats.weakAreasCount} weak area{stats.weakAreasCount === 1 ? '' : 's'} →{' '}
                <Text style={styles.premiumTag}>Premium</Text>
              </Text>
            )}
          </View>
        </View>

        {/* Streak */}
        <View style={styles.streakCard}>
          <View style={styles.streakHeaderRow}>
            <Icon name="bolt" size={22} color="#facc15" />
            <Text style={styles.streakTitle}>{stats ? `${stats.streakCount}-day streak 🔥` : '-- day streak'}</Text>
          </View>
          <Text style={styles.streakSub}>{stats?.streakCount > 0 ? 'Keep it going!' : 'Start practicing to build your streak.'}</Text>
          <View style={styles.weekRow}>
            {DAYS.map((day, i) => {
              const checked = stats?.weekChecked?.[i] ?? false;
              return (
              <View key={i} style={styles.weekCol}>
                <View style={[styles.weekDot, checked && styles.weekDotChecked]}>
                  {checked && (
                    <Icon name="check" size={13} color="#1e4080" />
                  )}
                </View>
                <Text style={styles.weekDayLabel}>{day}</Text>
              </View>
              );
            })}
          </View>
        </View>

        {/* Premium Upsell */}
        <View style={styles.premiumCard}>
          <Text style={styles.premiumPct}>+23%</Text>
          <Text style={styles.premiumText}>
            Average score improvement for students who completed their weak-area drills on Premium.
          </Text>
        </View>

        {/* Subject Coverage */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>SUBJECT COVERAGE</Text>
          {SUBJECTS.map(subject => (
            <View key={subject.name} style={styles.subjectRow}>
              <View style={styles.subjectLabelRow}>
                <Text style={styles.subjectName}>{subject.name}</Text>
                <Text style={styles.subjectPct}>{subject.pct}%</Text>
              </View>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    {width: `${subject.pct}%`, backgroundColor: subject.color},
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Performance Deep-Dive (locked) */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>PERFORMANCE DEEP-DIVE</Text>
          <View style={styles.deepDiveWrap}>
            <View style={styles.deepDiveContent}>
              {[...Array(5)].map((_, i) => (
                <View
                  key={i}
                  style={[styles.blurLine, {width: i % 2 === 0 ? '90%' : '65%', opacity: 0.2}]}
                />
              ))}
            </View>
            <View style={styles.deepDiveOverlay}>
              <TouchableOpacity style={styles.unlockButton}>
                <Text style={styles.unlockButtonText}>Unlock full analytics</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Log Out */}
        <TouchableOpacity style={styles.logoutButton} onPress={onSignOut}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        <View style={{height: 48}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EBF4FF',
  },
  container: {
    flex: 1,
    backgroundColor: '#EBF4FF',
  },

  // Header
  header: {
    backgroundColor: '#1e4080',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 22,
    fontFamily: FONTS.headingBold,
    color: '#ffffff',
  },
  name: {
    fontSize: 20,
    fontFamily: FONTS.headingBold,
    color: '#ffffff',
    marginBottom: 2,
  },
  email: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 6,
  },
  meta: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: 'rgba(255,255,255,0.7)',
  },

  // Section block
  sectionBlock: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: FONTS.headingBold,
    color: '#1e4080',
    letterSpacing: 1.2,
    marginBottom: 16,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#e2eaf5',
  },
  statValue: {
    fontSize: 26,
    fontFamily: FONTS.headingBold,
    color: '#1e4080',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: '#64748b',
    textAlign: 'center',
  },

  // White card (weak areas)
  whiteCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e4080',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  weakAreaContent: {
    flex: 1,
  },
  weakAreaTitle: {
    fontSize: 14,
    fontFamily: FONTS.headingBold,
    color: '#111827',
    marginBottom: 6,
  },
  weakAreaSub: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: '#6b7280',
    lineHeight: 19,
    marginBottom: 8,
  },
  weakAreaLink: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: '#374151',
  },
  premiumTag: {
    color: '#1e4080',
    fontFamily: FONTS.headingBold,
  },

  // Streak card
  streakCard: {
    backgroundColor: '#1e4080',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 18,
  },
  streakHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  streakTitle: {
    fontSize: 16,
    fontFamily: FONTS.headingBold,
    color: '#ffffff',
  },
  streakSub: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 16,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekCol: {
    alignItems: 'center',
    gap: 6,
  },
  weekDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekDotChecked: {
    backgroundColor: '#ffffff',
  },
  weekDayLabel: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: 'rgba(255,255,255,0.6)',
  },

  // Subject coverage
  subjectRow: {
    marginBottom: 16,
  },
  subjectLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subjectName: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: '#1f2937',
  },
  subjectPct: {
    fontSize: 14,
    fontFamily: FONTS.headingBold,
    color: '#1e4080',
  },
  progressBg: {
    height: 8,
    backgroundColor: '#dde8ff',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },

  // Premium card
  premiumCard: {
    backgroundColor: '#dde8ff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  premiumPct: {
    fontSize: 22,
    fontFamily: FONTS.headingBold,
    color: '#1e4080',
  },
  premiumText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.body,
    color: '#374151',
    lineHeight: 19,
  },

  // Deep dive locked
  deepDiveWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 120,
  },
  deepDiveContent: {
    padding: 16,
    gap: 12,
  },
  blurLine: {
    height: 12,
    backgroundColor: '#c7d9f0',
    borderRadius: 6,
  },
  deepDiveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(235,244,255,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockButton: {
    backgroundColor: '#1e4080',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  unlockButtonText: {
    fontSize: 14,
    fontFamily: FONTS.headingBold,
    color: '#ffffff',
  },

  // Log out
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2eaf5',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: FONTS.heading,
    color: '#ef4444',
  },
});

export default ProfileScreen;
