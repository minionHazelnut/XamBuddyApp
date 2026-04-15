import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {supabase} from '../lib/supabase';
import {FONTS, TEXT_COLORS} from '../lib/fonts';

const IN_PROGRESS_KEY = 'quizInProgress';
const SESSIONS_KEY = 'quizSessions';
const BOOKMARKS_KEY = 'quizBookmarks';

const FILTERS = ['All', 'Resume', 'Finished', 'Saved'];

const ProgressCircle = ({progress}) => {
  if (progress === 100) {
    return (
      <View style={circleStyles.completedBadge}>
        <Icon name="verified" size={36} color="#1e4080" />
      </View>
    );
  }
  if (progress === 0) {
    return null;
  }

  return (
    <View style={circleStyles.container}>
      <View style={circleStyles.trackCircle} />
      <View
        style={[
          circleStyles.progressArc,
          {
            borderTopColor: progress > 0 ? '#4a6a6a' : 'transparent',
            borderRightColor: progress > 25 ? '#4a6a6a' : 'transparent',
            borderBottomColor: progress > 50 ? '#4a6a6a' : 'transparent',
            borderLeftColor: progress > 75 ? '#4a6a6a' : 'transparent',
            transform: [{rotate: '-45deg'}],
          },
        ]}
      />
      <Text style={circleStyles.text}>{progress}%</Text>
    </View>
  );
};

const circleStyles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackCircle: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
    borderColor: '#e0e0e0',
  },
  progressArc: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
  },
  text: {
    fontSize: 11,
    fontFamily: FONTS.bodyBold,
    color: '#4a6a6a',
  },
  completedBadge: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const MCQScreen = ({navigation}) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState({});
  const [loading, setLoading] = useState(true);
  const [inProgressList, setInProgressList] = useState([]);
  const [sessionList, setSessionList] = useState([]);
  const [bookmarkList, setBookmarkList] = useState([]);

  useEffect(() => {
    fetchSubjectsAndChapters();
  }, []);

  useFocusEffect(useCallback(() => {
    const load = async () => {
      try {
        const [ipStr, sessStr, bmStr] = await Promise.all([
          AsyncStorage.getItem(IN_PROGRESS_KEY),
          AsyncStorage.getItem(SESSIONS_KEY),
          AsyncStorage.getItem(BOOKMARKS_KEY),
        ]);
        setInProgressList(ipStr ? JSON.parse(ipStr) : []);
        setSessionList(sessStr ? JSON.parse(sessStr).reverse() : []);
        setBookmarkList(bmStr ? JSON.parse(bmStr).reverse() : []);
      } catch (e) {}
    };
    load();
  }, []));

  const fetchSubjectsAndChapters = async () => {
    setLoading(true);
    const {data, error} = await supabase
      .from('questions')
      .select('subject, chapter')
      .eq('question_type', 'mcq');

    if (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      return;
    }

    // Extract unique subjects
    const uniqueSubjects = [...new Set(data.map(r => r.subject))];
    setSubjects(uniqueSubjects);

    // Group chapters by subject with question count
    const grouped = {};
    data.forEach(row => {
      if (!grouped[row.subject]) grouped[row.subject] = {};
      if (!grouped[row.subject][row.chapter]) {
        grouped[row.subject][row.chapter] = {name: row.chapter, count: 0, progress: 0};
      }
      grouped[row.subject][row.chapter].count++;
    });
    setChapters(grouped);

    if (uniqueSubjects.length > 0) {
      setSelectedSubject(uniqueSubjects[0]);
    }
    setLoading(false);
  };

  const currentChapters = selectedSubject && chapters[selectedSubject]
    ? Object.values(chapters[selectedSubject])
    : [];

  // Group chapters by first word as section name
  const sections = {};
  currentChapters.forEach(ch => {
    // Use chapter name without number prefix as section
    const cleanName = ch.name.replace(/^\d+\.\s*/, '');
    const sectionKey = selectedSubject;
    if (!sections[sectionKey]) sections[sectionKey] = [];
    sections[sectionKey].push({...ch, displayName: cleanName});
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a6a6a" />
          <Text style={styles.loadingText}>Loading chapters...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MCQ</Text>
        <View style={styles.backButton} />
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map(filter => (
          <TouchableOpacity
            key={filter}
            onPress={() => setActiveFilter(filter)}>
            <Text
              style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextActive,
              ]}>
              {filter}
            </Text>
            {activeFilter === filter && <View style={styles.filterUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* ALL tab — subject dropdown + chapter list */}
        {activeFilter === 'All' && (
          <>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setDropdownOpen(!dropdownOpen)}>
              <Text style={styles.dropdownText}>
                {selectedSubject || 'Choose your subject'}
              </Text>
              <Icon
                name={dropdownOpen ? 'expand-less' : 'expand-more'}
                size={28}
                color="#2d3748"
              />
            </TouchableOpacity>

            {dropdownOpen &&
              subjects.map(subject => (
                <TouchableOpacity
                  key={subject}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedSubject(subject);
                    setDropdownOpen(false);
                  }}>
                  <Text
                    style={[
                      styles.dropdownItemText,
                      subject === selectedSubject && {fontWeight: '700'},
                    ]}>
                    {subject}
                  </Text>
                </TouchableOpacity>
              ))}

            {Object.entries(sections).map(([sectionName, sectionChapters]) => (
              <View key={sectionName} style={styles.section}>
                <View style={styles.sectionDivider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.sectionTitle}>{sectionName}</Text>
                  <View style={[styles.dividerLine, {flex: 2}]} />
                </View>
                {sectionChapters.map((chapter, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.chapterCard}
                    onPress={() =>
                      navigation.navigate('ChapterDetail', {
                        subject: selectedSubject,
                        chapter: chapter.name,
                        questionCount: chapter.count,
                      })
                    }>
                    <View style={{flex: 1}}>
                      <Text style={styles.chapterName}>{chapter.displayName}</Text>
                      <Text style={styles.chapterCount}>
                        {chapter.count} questions
                      </Text>
                    </View>
                    <ProgressCircle progress={chapter.progress} />
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </>
        )}

        {/* RESUME tab — in-progress quizzes */}
        {activeFilter === 'Resume' && (
          <>
            {inProgressList.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="play-circle-outline" size={48} color="#c0caca" />
                <Text style={styles.emptyStateText}>No quizzes in progress</Text>
                <Text style={styles.emptyStateSubtext}>
                  Start a quiz and come back to resume it here
                </Text>
              </View>
            ) : (
              inProgressList.map(item => {
                const answered = Object.keys(item.answers || {}).length;
                const total = (item.questions || []).length;
                const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
                const chapterDisplay = item.chapter.replace(/^\d+\.\s*/, '');
                return (
                  <View key={item.id} style={styles.historyCard}>
                    <Text style={styles.historySubject}>{item.subject}</Text>
                    <Text style={styles.historyChapter}>{chapterDisplay}</Text>
                    <View style={styles.historyMeta}>
                      <Text style={styles.historyMetaText}>
                        {answered}/{total} answered · {pct}% done
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.resumeButton}
                      onPress={() =>
                        navigation.navigate('Quiz', {
                          subject: item.subject,
                          chapter: item.chapter,
                          difficulty: item.difficulty,
                          numQuestions: item.numQuestions,
                          resumeData: {
                            questions: item.questions,
                            currentIndex: item.currentIndex,
                            answers: item.answers,
                            startTime: item.startTime,
                          },
                        })
                      }>
                      <Text style={styles.resumeButtonText}>Resume</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </>
        )}

        {/* FINISHED tab — completed sessions */}
        {activeFilter === 'Finished' && (
          <>
            {sessionList.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="check-circle-outline" size={48} color="#c0caca" />
                <Text style={styles.emptyStateText}>No completed quizzes yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Finish a quiz to see your results here
                </Text>
              </View>
            ) : (
              sessionList.map(item => {
                const chapterDisplay = item.chapter.replace(/^\d+\.\s*/, '');
                const date = item.completedAt
                  ? new Date(item.completedAt).toLocaleDateString('en-IN', {day: 'numeric', month: 'short'})
                  : '';
                const accuracyColor = item.accuracy >= 80 ? '#4CAF50' : item.accuracy >= 50 ? '#FF9800' : '#ef5350';
                return (
                  <View key={item.id} style={styles.historyCard}>
                    <View style={styles.historyCardRow}>
                      <View style={{flex: 1}}>
                        <Text style={styles.historySubject}>{item.subject}</Text>
                        <Text style={styles.historyChapter}>{chapterDisplay}</Text>
                        <Text style={styles.historyMetaText}>
                          {item.correct}/{item.total} correct · {item.timeMins} min
                        </Text>
                      </View>
                      <View style={[styles.accuracyBadge, {borderColor: accuracyColor}]}>
                        <Text style={[styles.accuracyText, {color: accuracyColor}]}>
                          {item.accuracy}%
                        </Text>
                      </View>
                    </View>
                    {date ? <Text style={styles.historyDate}>{date}</Text> : null}
                  </View>
                );
              })
            )}
          </>
        )}

        {/* SAVED tab — bookmarked questions */}
        {activeFilter === 'Saved' && (
          <>
            {bookmarkList.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="bookmark-border" size={48} color="#c0caca" />
                <Text style={styles.emptyStateText}>No saved questions yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Bookmark questions during a quiz to save them here
                </Text>
              </View>
            ) : (
              bookmarkList.map((item, index) => (
                <View key={item.questionId || index} style={styles.historyCard}>
                  <Text style={styles.historySubject}>
                    {item.subject} · {item.chapter.replace(/^\d+\.\s*/, '')}
                  </Text>
                  <Text style={styles.savedQuestion} numberOfLines={3}>
                    {item.questionText}
                  </Text>
                  <View style={styles.savedAnswerRow}>
                    <Icon name="check-circle" size={16} color="#4CAF50" />
                    <Text style={styles.savedAnswerText}>
                      {item.correct_answer}: {item.options?.[item.correct_answer] || ''}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6a7a7a',
    fontFamily: FONTS.body,
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
    color: TEXT_COLORS.title,
    fontWeight: '300',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontFamily: FONTS.headingBold,
    color: TEXT_COLORS.title,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  filterText: {
    fontSize: 16,
    color: '#8a9a9a',
    fontFamily: FONTS.body,
  },
  filterTextActive: {
    color: TEXT_COLORS.title,
    fontFamily: FONTS.bodyBold,
  },
  filterUnderline: {
    height: 2,
    backgroundColor: '#2d3748',
    marginTop: 4,
    borderRadius: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dropdown: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownText: {
    fontSize: 16,
    color: '#8a9a9a',
    fontFamily: FONTS.body,
  },
  dropdownItem: {
    backgroundColor: '#ffffff',
    padding: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: TEXT_COLORS.title,
    fontFamily: FONTS.body,
  },
  section: {
    marginTop: 20,
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  sectionTitle: {
    fontSize: 15,
    color: TEXT_COLORS.subtitle,
    fontFamily: FONTS.heading,
  },
  chapterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  chapterName: {
    fontSize: 17,
    color: TEXT_COLORS.title,
    fontFamily: FONTS.body,
  },
  chapterCount: {
    fontSize: 13,
    color: '#8a9a9a',
    fontFamily: FONTS.body,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 30,
  },
  emptyStateText: {
    fontSize: 17,
    fontFamily: FONTS.bodyBold,
    color: '#8a9a9a',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#b0baba',
    fontFamily: FONTS.body,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  historyCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historySubject: {
    fontSize: 12,
    color: '#8a9a9a',
    fontFamily: FONTS.body,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyChapter: {
    fontSize: 16,
    fontFamily: FONTS.bodyBold,
    color: TEXT_COLORS.title,
    marginBottom: 6,
  },
  historyMeta: {
    marginBottom: 12,
  },
  historyMetaText: {
    fontSize: 13,
    color: '#8a9a9a',
    fontFamily: FONTS.body,
  },
  historyDate: {
    fontSize: 12,
    color: '#b0baba',
    fontFamily: FONTS.body,
    marginTop: 8,
  },
  resumeButton: {
    backgroundColor: '#1e4080',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  resumeButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  accuracyBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  accuracyText: {
    fontSize: 14,
    fontFamily: FONTS.bodyBold,
  },
  savedQuestion: {
    fontSize: 15,
    color: TEXT_COLORS.title,
    fontFamily: FONTS.body,
    lineHeight: 22,
    marginTop: 4,
    marginBottom: 10,
  },
  savedAnswerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  savedAnswerText: {
    fontSize: 13,
    color: '#4CAF50',
    fontFamily: FONTS.body,
    flex: 1,
  },
});

export default MCQScreen;
