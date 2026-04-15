import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = 'streakDays';

export const getLocalDateKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const markStreakDay = async () => {
  try {
    const today = getLocalDateKey();
    const stored = await AsyncStorage.getItem(STREAK_KEY);
    const days = stored ? JSON.parse(stored) : [];
    if (!days.includes(today)) {
      days.push(today);
      await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(days));
    }
  } catch (e) {}
};

export const loadStreakDays = async () => {
  try {
    const stored = await AsyncStorage.getItem(STREAK_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

// Counts consecutive days ending today or yesterday.
// Streak dies if the last activity was 2+ days ago.
export const computeStreak = days => {
  if (!days || days.length === 0) return 0;
  const set = new Set(days);

  const today = getLocalDateKey();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = getLocalDateKey(yesterdayDate);

  const startKey = set.has(today) ? today : set.has(yesterday) ? yesterday : null;
  if (!startKey) return 0;

  let count = 0;
  const [sy, sm, sd] = startKey.split('-').map(Number);
  // Use noon to avoid DST edge cases when stepping back by days
  const cursor = new Date(sy, sm - 1, sd, 12, 0, 0);

  while (true) {
    const key = getLocalDateKey(cursor);
    if (!set.has(key)) break;
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return count;
};
