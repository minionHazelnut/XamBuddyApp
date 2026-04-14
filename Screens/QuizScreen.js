import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {supabase} from '../lib/supabase';
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

const safeSetItem = async (key, value) => {
  if (!AsyncStorage) return;
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.warn('AsyncStorage setItem failed:', error?.message || error);
  }
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const QuizScreen = ({navigation, route}) => {
  const {subject, chapter, difficulty, numQuestions} = route.params;
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  const chapterDisplay = chapter.replace(/^\d+\.\s*/, '');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setStartTime(Date.now());
    let query = supabase
      .from('questions')
      .select('*')
      .eq('subject', subject)
      .eq('chapter', chapter)
      .eq('question_type', 'mcq');

    if (difficulty !== 'all') {
      query = query.eq('difficulty', difficulty);
    }

    query = query.limit(numQuestions);

    const {data, error} = await query;

    if (error) {
      console.error('Error fetching questions:', error);
    } else {
      setQuestions(data || []);
    }
    setLoading(false);
  };

  const currentQuestion = questions[currentIndex];

  const handleOptionPress = optionKey => {
    setSelectedAnswer(optionKey);
    setAnswers(prev => ({...prev, [currentIndex]: optionKey}));
  };

  const goNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(answers[currentIndex + 1] || null);
      setShowExplanation(false);
      setBookmarked(false);
    } else {
      await saveQuizResult();
      setQuizFinished(true);
    }
  };

  const goPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(answers[currentIndex - 1] || null);
      setShowExplanation(false);
      setBookmarked(false);
    }
  };

  const getScore = () => {
    let correct = 0;
    let attempted = 0;
    questions.forEach((q, i) => {
      if (answers[i]) {
        attempted++;
        if (answers[i] === q.correct_answer) correct++;
      }
    });
    return {correct, attempted, total: questions.length};
  };

  const saveQuizResult = async () => {
    const {correct, attempted, total} = getScore();
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const timeMins = Math.max(1, Math.round((Date.now() - startTime) / 60000));
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const entry = {
      date,
      subject,
      chapter,
      difficulty,
      correct,
      wrong: attempted - correct,
      attempted,
      total,
      accuracy,
      timeMins,
      strongestTopic: chapter,
      weakTopic: attempted - correct > 0 ? chapter : subject,
      timestamp: now.toISOString(),
    };

    if (!AsyncStorage) {
      console.warn('Skipping quiz progress save because AsyncStorage is unavailable.');
      return;
    }

    try {
      const stored = await safeGetItem('quizProgressHistory');
      const history = stored ? JSON.parse(stored) : [];
      const existingIndex = history.findIndex(item => item.date === date);

      if (existingIndex >= 0) {
        const existing = history[existingIndex];
        const combinedAttempted = existing.attempted + attempted;
        const combinedCorrect = existing.correct + correct;
        const combinedTotal = existing.total + total;
        history[existingIndex] = {
          ...existing,
          subject,
          chapter,
          difficulty,
          correct: combinedCorrect,
          wrong: existing.wrong + entry.wrong,
          attempted: combinedAttempted,
          total: combinedTotal,
          accuracy:
            combinedAttempted > 0
              ? Math.round((combinedCorrect / combinedAttempted) * 100)
              : 0,
          timeMins: Math.round((existing.timeMins + timeMins) / 2),
          strongestTopic: chapter,
          weakTopic: attempted - correct > 0 ? chapter : subject,
          timestamp: now.toISOString(),
        };
      } else {
        history.push(entry);
      }

      await safeSetItem('quizProgressHistory', JSON.stringify(history));
    } catch (error) {
      console.warn('Error saving quiz progress:', error?.message || error);
    }
  };

  const retakeQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswers({});
    setShowExplanation(false);
    setQuizFinished(false);
    setStartTime(Date.now());
  };

  const getOptionStyle = optionKey => {
    if (!selectedAnswer) return styles.option;
    if (optionKey === currentQuestion.correct_answer) {
      return [styles.option, styles.optionCorrect];
    }
    if (
      optionKey === selectedAnswer &&
      optionKey !== currentQuestion.correct_answer
    ) {
      return [styles.option, styles.optionWrong];
    }
    return styles.option;
  };

  const getLabelStyle = optionKey => {
    if (!selectedAnswer) return styles.optionLabel;
    if (optionKey === currentQuestion.correct_answer) {
      return [styles.optionLabel, styles.optionLabelCorrect];
    }
    if (
      optionKey === selectedAnswer &&
      optionKey !== currentQuestion.correct_answer
    ) {
      return [styles.optionLabel, styles.optionLabelWrong];
    }
    return styles.optionLabel;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a6a6a" />
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (quizFinished) {
    const {correct, attempted, total} = getScore();
    const percentage = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{chapterDisplay}</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreEmoji}>
            {percentage >= 80 ? '🎉' : percentage >= 50 ? '👍' : '📚'}
          </Text>
          <Text style={styles.scoreTitle}>Quiz Complete!</Text>

          <View style={styles.scoreCircle}>
            <Text style={styles.scorePercentage}>{percentage}%</Text>
          </View>

          <View style={styles.scoreDetails}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Correct</Text>
              <Text style={styles.scoreValue}>{correct}</Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Wrong</Text>
              <Text style={styles.scoreValue}>{attempted - correct}</Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Skipped</Text>
              <Text style={styles.scoreValue}>{total - attempted}</Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Total Questions</Text>
              <Text style={styles.scoreValue}>{total}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.retakeButton} onPress={retakeQuiz}>
            <Text style={styles.retakeButtonText}>Retake Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToChaptersButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backToChaptersText}>Back to Chapters</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{chapterDisplay}</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            No questions found for this selection.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const options = currentQuestion.options || {};
  const optionKeys = Object.keys(options).sort();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{chapterDisplay}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Question */}
        <Text style={styles.questionText}>
          {currentIndex + 1}. {currentQuestion.question_text}
        </Text>

        {/* Options */}
        {optionKeys.map(key => (
          <TouchableOpacity
            key={key}
            style={getOptionStyle(key)}
            onPress={() => handleOptionPress(key)}
            disabled={selectedAnswer !== null}>
            <View style={getLabelStyle(key)}>
              <Text style={styles.optionLabelText}>{key}</Text>
            </View>
            <Text style={styles.optionText}>{options[key]}</Text>
          </TouchableOpacity>
        ))}

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Text style={styles.statBadgeText}>
              {currentIndex + 1}/{questions.length}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setBookmarked(!bookmarked)}>
            <Icon
              name={bookmarked ? 'bookmark' : 'bookmark-border'}
              size={28}
              color="#8a9a9a"
            />
          </TouchableOpacity>
        </View>

        {/* Explanation */}
        {selectedAnswer && (
          <TouchableOpacity
            onPress={() => setShowExplanation(!showExplanation)}>
            <Text style={styles.explanationToggle}>Explanation</Text>
          </TouchableOpacity>
        )}

        {showExplanation && currentQuestion.explanation && (
          <View style={styles.explanationBox}>
            <Text style={styles.explanationText}>
              {currentQuestion.explanation}
            </Text>
          </View>
        )}

        <View style={{height: 100}} />
      </ScrollView>

      {/* Bottom navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrev]}
          onPress={goPrevious}
          disabled={currentIndex === 0}>
          <Text
            style={[
              styles.navButtonText,
              currentIndex === 0 && {color: '#ccc'},
            ]}>
            Previous
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentIndex === questions.length - 1
              ? styles.navButtonFinish
              : styles.navButtonNext,
          ]}
          onPress={goNext}>
          <Text
            style={
              currentIndex === questions.length - 1
                ? styles.navButtonFinishText
                : styles.navButtonTextNext
            }>
            {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 12,
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
    fontSize: 22,
    fontFamily: FONTS.headingBold,
    color: TEXT_COLORS.title,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  questionText: {
    fontSize: 19,
    fontFamily: FONTS.bodyBold,
    color: TEXT_COLORS.title,
    lineHeight: 28,
    marginBottom: 24,
  },
  option: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  optionCorrect: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  optionWrong: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ef5350',
  },
  optionLabel: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e8eef4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionLabelCorrect: {
    backgroundColor: '#4CAF50',
  },
  optionLabelWrong: {
    backgroundColor: '#ef5350',
  },
  optionLabelText: {
    fontSize: 15,
    fontFamily: FONTS.bodyBold,
    color: TEXT_COLORS.title,
  },
  optionText: {
    fontSize: 16,
    color: TEXT_COLORS.title,
    fontFamily: FONTS.body,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statBadgeText: {
    fontSize: 14,
    color: '#8a9a9a',
    fontFamily: FONTS.body,
  },
  explanationToggle: {
    fontSize: 16,
    color: '#4a6a6a',
    fontFamily: FONTS.body,
    textAlign: 'center',
    paddingVertical: 8,
  },
  explanationBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  explanationText: {
    fontSize: 15,
    color: '#4a5568',
    fontFamily: FONTS.body,
    lineHeight: 22,
  },
  bottomNav: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
    backgroundColor: '#f5f5f5',
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  navButtonPrev: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#ffffff',
  },
  navButtonNext: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#ffffff',
  },
  navButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#8a9a9a',
  },
  navButtonTextNext: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2d3748',
  },
  navButtonFinish: {
    backgroundColor: '#5a7a7a',
  },
  navButtonFinishText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  scoreContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  scoreEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  scoreTitle: {
    fontSize: 26,
    fontFamily: FONTS.headingBold,
    color: TEXT_COLORS.title,
    marginBottom: 24,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: '#5a7a7a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  scorePercentage: {
    fontSize: 32,
    fontFamily: FONTS.headingBold,
    color: TEXT_COLORS.title,
  },
  scoreDetails: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#6a7a7a',
    fontFamily: FONTS.body,
  },
  scoreValue: {
    fontSize: 16,
    fontFamily: FONTS.bodyBold,
    color: TEXT_COLORS.title,
  },
  scoreDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  retakeButton: {
    backgroundColor: '#5a7a7a',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 50,
    marginBottom: 14,
    width: '100%',
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  backToChaptersButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 50,
    width: '100%',
    alignItems: 'center',
  },
  backToChaptersText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#6a7a7a',
  },
});

export default QuizScreen;
