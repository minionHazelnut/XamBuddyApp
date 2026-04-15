import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FONTS} from '../lib/fonts';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const STREAK_CHECKED = [true, true, true, true, false, true, false];

const SUBJECTS = [
  {name: 'Physics', pct: 68, color: '#6366f1'},
  {name: 'Maths', pct: 45, color: '#ef4444'},
  {name: 'Chemistry', pct: 81, color: '#22c55e'},
  {name: 'English', pct: 92, color: '#3b82f6'},
];

const ProfileScreen = ({user, onSignOut}) => {
  const email = user?.email ?? '';
  const initials = email ? email.slice(0, 2).toUpperCase() : 'AR';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>Ananya Reddy</Text>
          <Text style={styles.meta}>Class 11 · CBSE · Free plan</Text>
        </View>

        {/* My Progress */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>MY PROGRESS</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>74%</Text>
              <Text style={styles.statLabel}>Avg accuracy</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>312</Text>
              <Text style={styles.statLabel}>Qs answered</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>18</Text>
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
            <Text style={styles.weakAreaTitle}>We found 9 weak areas in your prep</Text>
            <Text style={styles.weakAreaSub}>
              Maths chapters where you're losing marks — identified from your last 5 tests.
            </Text>
            <Text style={styles.weakAreaLink}>
              See all 9 weak areas →{' '}
              <Text style={styles.premiumTag}>Premium</Text>
            </Text>
          </View>
        </View>

        {/* Streak */}
        <View style={styles.darkCard}>
          <View style={styles.streakHeaderRow}>
            <Icon name="bolt" size={22} color="#facc15" />
            <Text style={styles.streakTitle}>12-day streak 🔥</Text>
          </View>
          <Text style={styles.streakSub}>Longest: 21 days · Keep it going</Text>
          <View style={styles.weekRow}>
            {DAYS.map((day, i) => (
              <View key={i} style={styles.weekCol}>
                <View style={[styles.weekDot, STREAK_CHECKED[i] && styles.weekDotChecked]}>
                  {STREAK_CHECKED[i] && (
                    <Icon name="check" size={13} color="#ffffff" />
                  )}
                </View>
                <Text style={styles.weekDayLabel}>{day}</Text>
              </View>
            ))}
          </View>
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

        {/* Premium Upsell */}
        <View style={styles.premiumCard}>
          <Text style={styles.premiumPct}>+23%</Text>
          <Text style={styles.premiumText}>
            Average score improvement for students who completed their weak-area drills on Premium.
          </Text>
        </View>

        {/* Performance Deep-Dive (locked) */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>PERFORMANCE DEEP-DIVE</Text>
          <View style={styles.deepDiveWrap}>
            <View style={styles.deepDiveContent}>
              {[...Array(5)].map((_, i) => (
                <View
                  key={i}
                  style={[styles.blurLine, {width: i % 2 === 0 ? '90%' : '65%', opacity: 0.15}]}
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
    backgroundColor: '#0f1117',
  },
  container: {
    flex: 1,
    backgroundColor: '#0f1117',
  },

  // Header
  header: {
    backgroundColor: '#1e1b4b',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7c3aed',
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
    marginBottom: 6,
  },
  meta: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: '#a5b4fc',
  },

  // Section block (dark bg with label)
  sectionBlock: {
    backgroundColor: '#161b27',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
    marginTop: 28,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: FONTS.headingBold,
    color: '#6b7280',
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
    backgroundColor: '#2d3748',
  },
  statValue: {
    fontSize: 26,
    fontFamily: FONTS.headingBold,
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: '#9ca3af',
    textAlign: 'center',
  },

  // White card (weak areas)
  whiteCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 28,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
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
    color: '#7c3aed',
    fontFamily: FONTS.headingBold,
  },

  // Streak card
  darkCard: {
    backgroundColor: '#1e2330',
    marginHorizontal: 16,
    marginTop: 28,
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
    color: '#9ca3af',
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
    backgroundColor: '#2d3748',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekDotChecked: {
    backgroundColor: '#4f46e5',
  },
  weekDayLabel: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: '#9ca3af',
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
    color: '#e5e7eb',
  },
  subjectPct: {
    fontSize: 14,
    fontFamily: FONTS.headingBold,
    color: '#e5e7eb',
  },
  progressBg: {
    height: 8,
    backgroundColor: '#2d3748',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },

  // Premium card
  premiumCard: {
    backgroundColor: '#f0fdf4',
    marginHorizontal: 16,
    marginTop: 28,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  premiumPct: {
    fontSize: 22,
    fontFamily: FONTS.headingBold,
    color: '#16a34a',
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
    backgroundColor: '#9ca3af',
    borderRadius: 6,
  },
  deepDiveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(22, 27, 39, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockButton: {
    backgroundColor: '#1f2937',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  unlockButtonText: {
    fontSize: 14,
    fontFamily: FONTS.headingBold,
    color: '#ffffff',
  },

  // Log out
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 36,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#1e2330',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d3748',
  },
  logoutText: {
    fontSize: 15,
    fontFamily: FONTS.heading,
    color: '#ef4444',
  },
});

export default ProfileScreen;
