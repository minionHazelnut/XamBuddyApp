import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FONTS, TEXT_COLORS} from '../lib/fonts';

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

const ChapterDetailScreen = ({navigation, route}) => {
  const {subject, chapter, questionCount} = route.params;
  const [difficulty, setDifficulty] = useState('All');
  const [diffDropdownOpen, setDiffDropdownOpen] = useState(false);
  const [numQuestions, setNumQuestions] = useState(
    Math.min(30, questionCount),
  );

  const chapterDisplay = chapter.replace(/^\d+\.\s*/, '');
  const estimatedTime = Math.ceil(numQuestions * 1) + ' mins';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{subject}</Text>
          <View style={styles.backButton} />
        </View>

        <Text style={styles.chapterName}>{chapterDisplay}</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <Text style={styles.statText}>{questionCount} Questions</Text>
          <Text style={styles.statText}>{estimatedTime}</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.instructionsLabel}>Instructions:</Text>
          <View style={[styles.dividerLine, {flex: 2}]} />
        </View>

        <View style={styles.instructionsList}>
          <Text style={styles.instructionItem}>
            1. MCQs can be saved for future reference
          </Text>
          <Text style={styles.instructionItem}>
            2. The quiz can be retaken once done.
          </Text>
        </View>

        {/* Difficulty dropdown */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setDiffDropdownOpen(!diffDropdownOpen)}>
          <Text style={styles.dropdownText}>
            {difficulty === 'All' ? 'Level of Difficulty' : difficulty}
          </Text>
          <Icon
            name={diffDropdownOpen ? 'expand-less' : 'expand-more'}
            size={28}
            color="#2d3748"
          />
        </TouchableOpacity>

        {diffDropdownOpen &&
          DIFFICULTIES.map(d => (
            <TouchableOpacity
              key={d}
              style={styles.dropdownItem}
              onPress={() => {
                setDifficulty(d);
                setDiffDropdownOpen(false);
              }}>
              <Text
                style={[
                  styles.dropdownItemText,
                  d === difficulty && {fontWeight: '700'},
                ]}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}

        {/* Number of questions */}
        <View style={styles.numQsCard}>
          <Text style={styles.numQsLabel}>No of Qs</Text>
          <View style={styles.numQsControls}>
            <TouchableOpacity
              onPress={() => setNumQuestions(Math.max(1, numQuestions - 5))}
              style={styles.numQsBtn}>
              <Text style={styles.numQsBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.numQsValue}>{numQuestions}</Text>
            <TouchableOpacity
              onPress={() =>
                setNumQuestions(Math.min(questionCount, numQuestions + 5))
              }
              style={styles.numQsBtn}>
              <Text style={styles.numQsBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Start Quiz card */}
        <View style={styles.startCard}>
          <Text style={styles.moduleName}>{chapterDisplay}</Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() =>
              navigation.navigate('Quiz', {
                subject,
                chapter,
                difficulty: difficulty.toLowerCase(),
                numQuestions,
              })
            }>
            <Text style={styles.startButtonText}>Start Quiz</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
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
  chapterName: {
    textAlign: 'center',
    fontSize: 20,
    color: '#8a9a9a',
    fontFamily: FONTS.heading,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    marginBottom: 24,
  },
  statText: {
    fontSize: 16,
    color: '#4a5568',
    fontFamily: FONTS.body,
  },
  instructionsDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  instructionsLabel: {
    fontSize: 15,
    color: TEXT_COLORS.subtitle,
    fontFamily: FONTS.body,
  },
  instructionsList: {
    paddingHorizontal: 30,
    marginBottom: 28,
  },
  instructionItem: {
    fontSize: 15,
    color: '#6a7a7a',
    fontFamily: FONTS.body,
    lineHeight: 26,
  },
  dropdown: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    marginHorizontal: 20,
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
  numQsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  numQsLabel: {
    fontSize: 16,
    color: '#8a9a9a',
    fontFamily: FONTS.body,
  },
  numQsControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  numQsBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numQsBtnText: {
    fontSize: 20,
    color: '#2d3748',
    fontWeight: '600',
  },
  numQsValue: {
    fontSize: 18,
    fontFamily: FONTS.bodyBold,
    color: TEXT_COLORS.title,
    minWidth: 30,
    textAlign: 'center',
  },
  startCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 24,
    marginHorizontal: 20,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  moduleName: {
    fontSize: 18,
    fontFamily: FONTS.headingBold,
    color: TEXT_COLORS.title,
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#1e4080',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 60,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ChapterDetailScreen;
