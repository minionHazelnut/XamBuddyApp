import React, {useState, useEffect, useMemo} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
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
  const strongestTopic = summaryDays.length
    ? summaryDays[summaryDays.length - 1].strongestTopic
    : '-';
  const weakTopic = summaryDays.length
    ? summaryDays[summaryDays.length - 1].weakTopic
    : '-';

  const actionLabel = displayEntries.length
    ? 'Come back tomorrow!'
    : "Start today’s practice";
  const noteLabel = displayEntries.length
    ? 'You have recent progress. Keep the momentum going.'
    : 'Practice now to see live results!';

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
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Last 3 days performance</Text>
          </View>
          <View style={styles.chartArea}>
            <View style={styles.yAxisLine} />
            <View style={styles.barsRow}>
              {barItems.map((item, index) => {
                const height = item.placeholder
                  ? 80
                  : 50 + (item.correct / Math.max(item.total, 1)) * 120;
                const barStyle = item.placeholder
                  ? styles.barPlaceholder
                  : styles.barActive;
                return (
                  <View key={index} style={styles.barColumn}>
                    <View style={[styles.bar, barStyle, {height}]} />
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
          style={styles.actionButton}
          onPress={() => navigation.navigate('Practice')}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Icon name="east" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.noteText}>{noteLabel}</Text>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Last 3 days Average</Text>
            <Text style={styles.detailValue}>
              {summaryDays.length ? `${averageScore}/20` : '--/20'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Accuracy</Text>
            <Text style={styles.detailValue}>
              {summaryDays.length ? `${averageAccuracy}%` : '--%'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Strongest topic</Text>
            <Text style={[styles.detailValue, styles.topicValue]}>
              {strongestTopic}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Weak topic</Text>
            <Text style={[styles.detailValue, styles.topicValue]}>{weakTopic}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Average time taken</Text>
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
  },
  chartArea: {
    height: 220,
    justifyContent: 'flex-end',
  },
  yAxisLine: {
    position: 'absolute',
    left: 20,
    top: 12,
    bottom: 24,
    width: 1,
    backgroundColor: '#cbd5e1',
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
  bar: {
    width: 20,
    borderRadius: 12,
    marginBottom: 10,
  },
  barActive: {
    backgroundColor: '#4c8cff',
  },
  barPlaceholder: {
    backgroundColor: 'rgba(76, 140, 255, 0.25)',
  },
  barLabel: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: FONTS.body,
    marginTop: 6,
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
    alignItems: 'flex-start',
    marginBottom: 18,
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
    width: 120,
  },
  topicValue: {
    color: '#4a5568',
    width: 140,
  },
});

export default ProgressScreen;
