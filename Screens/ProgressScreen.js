import React, {useState, useEffect, useMemo} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FONTS, TEXT_COLORS} from '../lib/fonts';

let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (error) {
  AsyncStorage = null;
  console.warn('AsyncStorage unavailable:', error?.message || error);
}

const safeGetItem = async key => {
  if (!AsyncStorage) return null;
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.warn('AsyncStorage getItem failed:', error?.message || error);
    return null;
  }
};

const formatDayLabel = date =>
  date.toLocaleDateString('en-US', {weekday: 'short'}).toUpperCase();

const parseDateKey = dateStr => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getDateKey = date => date.toISOString().split('T')[0];

const getDayDifference = (earlier, later) =>
  Math.round((later - earlier) / (1000 * 60 * 60 * 24));

const getBarColor = accuracy => {
  if (accuracy >= 80) return '#22c55e';
  if (accuracy >= 50) return '#f59e0b';
  return '#ef4444';
};

const ProgressScreen = ({navigation}) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    if (!AsyncStorage) {
      console.warn('AsyncStorage unavailable: progress history cannot be loaded.');
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      const stored = await safeGetItem('quizProgressHistory');
      const parsed = stored ? JSON.parse(stored) : [];
      setHistory(parsed);
    } catch (error) {
      console.warn('Error loading progress history:', error?.message || error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    const unsubscribe = navigation.addListener('focus', loadHistory);
    return unsubscribe;
  }, [navigation]);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const todayKey = getDateKey(today);

  const dailyHistory = useMemo(() => {
    const grouped = {};
    history.forEach(entry => {
      const key = entry.date;
      if (!grouped[key]) {
        grouped[key] = {
          ...entry,
          date: key,
        };
      } else {
        const existing = grouped[key];
        const combinedAttempted = existing.attempted + entry.attempted;
        const combinedCorrect = existing.correct + entry.correct;
        grouped[key] = {
          ...existing,
          correct: combinedCorrect,
          wrong: existing.wrong + entry.wrong,
          attempted: combinedAttempted,
          total: existing.total + entry.total,
          accuracy:
            combinedAttempted > 0
              ? Math.round((combinedCorrect / combinedAttempted) * 100)
              : 0,
          timeMins: Math.round((existing.timeMins + entry.timeMins) / 2),
          strongestTopic: entry.chapter || existing.strongestTopic,
          weakTopic: entry.chapter || existing.weakTopic,
          timestamp: entry.timestamp,
        };
      }
    });
    return Object.values(grouped)
      .map(entry => ({...entry, dateObj: parseDateKey(entry.date)}))
      .sort((a, b) => a.dateObj - b.dateObj);
  }, [history]);

  const practicedDays = useMemo(
    () => new Set(dailyHistory.map(e => e.date)),
    [dailyHistory],
  );

  const weekDays = useMemo(() => {
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    return Array.from({length: 7}, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [today]);

  const activeStreakEntries = useMemo(() => {
    if (dailyHistory.length === 0) return [];

    const entriesByDate = dailyHistory.reduce((acc, entry) => {
      acc[entry.date] = entry;
      return acc;
    }, {});

    const sortedDates = dailyHistory.map(entry => entry.dateObj);
    const lastDate = sortedDates[sortedDates.length - 1];
    const lastDateKey = getDateKey(lastDate);
    const daysSinceLast = getDayDifference(lastDate, today);

    if (daysSinceLast > 2) {
      return [];
    }

    const streak = [];
    let cursor = new Date(lastDate);
    while (streak.length < 3) {
      const key = getDateKey(cursor);
      if (entriesByDate[key]) {
        streak.unshift(entriesByDate[key]);
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [dailyHistory, today]);

  const displayEntries = activeStreakEntries;
  const placeholderCount = 3 - displayEntries.length;
  const barItems = [
    ...Array.from({length: placeholderCount}).map(() => ({placeholder: true})),
    ...displayEntries.map(entry => ({...entry, placeholder: false})),
  ];

  const summaryDays = displayEntries;
  const averageScore = summaryDays.length
    ? Math.round(
        summaryDays.reduce((sum, item) => sum + item.correct, 0) /
          summaryDays.length,
      )
    : 0;
  const averageAccuracy = summaryDays.length
    ? Math.round(
        summaryDays.reduce((sum, item) => sum + item.accuracy, 0) /
          summaryDays.length,
      )
    : 0;
  const averageTime = summaryDays.length
    ? Math.round(
        summaryDays.reduce((sum, item) => sum + item.timeMins, 0) /
          summaryDays.length,
      )
    : 0;

  const practicedToday = practicedDays.has(todayKey);
  const lastEntry = dailyHistory.length
    ? dailyHistory[dailyHistory.length - 1]
    : null;
  const daysSinceLast = lastEntry
    ? getDayDifference(lastEntry.dateObj, today)
    : Infinity;
  const streakAlive = daysSinceLast <= 1;

  const actionLabel = practicedToday
    ? 'Maintain my streak'
    : streakAlive
    ? 'Don\'t break your streak'
    : 'Start a new streak';
  const noteLabel = practicedToday
    ? 'Great work! You practiced today. Keep the momentum going.'
    : streakAlive
    ? 'Practice once today to keep your streak alive.'
    : 'Practice now to start building your streak.';
  const actionButtonColor = practicedToday
    ? '#16a34a'
    : streakAlive
    ? '#d97706'
    : '#4c8cff';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={26} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progress</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Last 3 days performance</Text>

          {/* 7-day dot calendar */}
          <View style={styles.weekCalendar}>
            {weekDays.map((day, i) => {
              const key = getDateKey(day);
              const practiced = practicedDays.has(key);
              const isToday = key === todayKey;
              return (
                <View key={i} style={styles.weekCol}>
                  <Text style={styles.weekDayLabel}>
                    {day.toLocaleDateString('en-US', {weekday: 'short'}).slice(0, 1)}
                  </Text>
                  <View
                    style={[
                      styles.weekDot,
                      practiced && styles.weekDotFilled,
                      isToday && !practiced && styles.weekDotToday,
                    ]}
                  />
                </View>
              );
            })}
          </View>

          {/* Bar chart */}
          <View style={styles.chartArea}>
            <View style={styles.barsRow}>
              {barItems.map((item, index) => {
                const height = item.placeholder
                  ? 60
                  : 50 + (item.correct / Math.max(item.total, 1)) * 120;
                return (
                  <View key={index} style={styles.barColumn}>
                    <Text style={styles.barAccuracyLabel}>
                      {item.placeholder ? '' : `${item.accuracy}%`}
                    </Text>
                    <View
                      style={[
                        styles.bar,
                        item.placeholder
                          ? styles.barPlaceholder
                          : {backgroundColor: getBarColor(item.accuracy)},
                        {height},
                      ]}
                    />
                    <Text style={styles.barLabel}>
                      {item.placeholder ? '-' : formatDayLabel(item.dateObj)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.actionButton, {backgroundColor: actionButtonColor}]}
          onPress={() => navigation.navigate('Practice')}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Icon name="east" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.noteText}>{noteLabel}</Text>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>3-day avg score</Text>
            <Text style={styles.detailValue}>
              {summaryDays.length ? `${averageScore} correct` : '--'}
            </Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>3-day avg accuracy</Text>
            <Text style={styles.detailValue}>
              {summaryDays.length ? `${averageAccuracy}%` : '--%'}
            </Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>3-day avg time</Text>
            <Text style={styles.detailValue}>
              {summaryDays.length ? `${averageTime} mins` : '-- mins'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fcff',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
    backgroundColor: '#ffffff',
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontFamily: FONTS.heading,
    color: TEXT_COLORS.title,
  },
  headerSpacer: {
    width: 48,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
    marginBottom: 18,
  },
  chartHeader: {
    marginBottom: 14,
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: FONTS.headingBold,
    color: TEXT_COLORS.title,
    marginBottom: 16,
  },
  weekCalendar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  weekCol: {
    alignItems: 'center',
    gap: 6,
  },
  weekDayLabel: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: '#94a3b8',
  },
  weekDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    backgroundColor: 'transparent',
  },
  weekDotFilled: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  weekDotToday: {
    borderColor: '#4c8cff',
    borderWidth: 2,
  },
  chartArea: {
    justifyContent: 'flex-end',
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
  },
  barColumn: {
    width: 50,
    alignItems: 'center',
  },
  barAccuracyLabel: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: '#334155',
    height: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  bar: {
    width: 22,
    borderRadius: 12,
  },
  barPlaceholder: {
    backgroundColor: '#e2e8f0',
  },
  barLabel: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: FONTS.body,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4c8cff',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 4,
    marginBottom: 10,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: FONTS.heading,
    marginRight: 8,
  },
  noteText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 14,
    marginBottom: 24,
    fontFamily: FONTS.body,
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  detailLabel: {
    fontSize: 14,
    color: '#334155',
    fontFamily: FONTS.body,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: FONTS.headingBold,
    color: TEXT_COLORS.title,
    textAlign: 'right',
  },
});

export default ProgressScreen;
