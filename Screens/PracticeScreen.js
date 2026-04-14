import React, {useMemo, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {FONTS, TEXT_COLORS} from '../lib/fonts';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MCQScreen from './MCQScreen';
import ChapterDetailScreen from './ChapterDetailScreen';
import QuizScreen from './QuizScreen';

const Stack = createNativeStackNavigator();

const DropdownSelector = ({
  label,
  options,
  selected,
  onSelect,
  open,
  onToggle,
}) => (
  <View style={styles.dropdownGroup}>
    <Text style={styles.formLabel}>{label}</Text>
    <TouchableOpacity style={styles.dropdownHeader} onPress={onToggle}>
      <Text style={styles.dropdownHeaderText}>{selected || 'Select an option'}</Text>
      <Icon
        name={open ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
        size={24}
        color="#334155"
      />
    </TouchableOpacity>
    {open && (
      <View style={styles.dropdownList}>
        {options.map(option => (
          <TouchableOpacity
            key={option}
            style={
              selected === option
                ? [styles.dropdownItem, styles.dropdownItemActive]
                : styles.dropdownItem
            }
            onPress={() => {
              onSelect(option);
              onToggle();
            }}>
            <Text
              style={
                selected === option
                  ? styles.dropdownItemTextActive
                  : styles.dropdownItemText
              }>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
  </View>
);

const LONG_ANSWER_DATA = [
  {
    id: 'la-1',
    subject: 'Biology',
    chapter: 'Human Anatomy',
    difficulty: 'Easy',
    question: 'Trace the path of blood through the human heart, naming all four chambers and the blood vessels involved.',
    answer:
      'The blood enters the right atrium from the superior and inferior vena cavae. It then passes through the tricuspid valve to the right ventricle. From the right ventricle, the blood is pumped through the pulmonary valve into the pulmonary artery and travels to the lungs. Oxygenated blood returns via the pulmonary veins into the left atrium. It then passes through the mitral valve into the left ventricle, which pumps it through the aortic valve into the aorta and into the body. The four chambers are the right atrium, right ventricle, left atrium, and left ventricle.',
  },
  {
    id: 'la-2',
    subject: 'Biology',
    chapter: 'Human Anatomy',
    difficulty: 'Medium',
    question: 'Explain why the human heart is called a double pump.',
    answer:
      'The human heart is called a double pump because it pumps blood through two separate circuits simultaneously. The right side of the heart pumps deoxygenated blood to the lungs (pulmonary circulation), while the left side pumps oxygenated blood to the rest of the body (systemic circulation). Each side has its own atrium and ventricle, forming two pumps in one organ.',
  },
  {
    id: 'la-3',
    subject: 'Biology',
    chapter: 'Human Anatomy',
    difficulty: 'Difficult',
    question: 'Describe the role of valves in ensuring unidirectional blood flow in the heart.',
    answer:
      'Valves in the heart prevent backflow by opening and closing in response to pressure changes. The tricuspid and mitral valves separate the atria from the ventricles, while the pulmonary and aortic valves separate the ventricles from the arteries. When a chamber contracts, the valve ahead of the blood opens and the valve behind it closes. This ensures blood flows in one direction: right atrium → right ventricle → pulmonary artery → lungs → left atrium → left ventricle → aorta → body.',
  },
];

const SHORT_ANSWER_DATA = [
  {
    id: 'sa-1',
    subject: 'Biology',
    chapter: 'Cell Biology',
    difficulty: 'Easy',
    question: 'What is the function of mitochondria?',
    answer: 'Mitochondria are the cell’s powerhouses; they generate ATP through cellular respiration.',
  },
  {
    id: 'sa-2',
    subject: 'Biology',
    chapter: 'Cell Biology',
    difficulty: 'Medium',
    question: 'Define osmosis.',
    answer: 'Osmosis is the movement of water across a semipermeable membrane from a region of low solute concentration to a region of high solute concentration.',
  },
  {
    id: 'sa-3',
    subject: 'Biology',
    chapter: 'Human Anatomy',
    difficulty: 'Easy',
    question: 'Name the four chambers of the heart.',
    answer: 'The four chambers of the heart are the right atrium, right ventricle, left atrium, and left ventricle.',
  },
  {
    id: 'sa-4',
    subject: 'Chemistry',
    chapter: 'Periodic Table',
    difficulty: 'Medium',
    question: 'What is an element?',
    answer: 'An element is a pure substance made of only one type of atom that cannot be broken down by chemical means.',
  },
];

const PracticeHome = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.practiceHeader}>
        <Text style={styles.practiceTitle}>Practice</Text>
        <Text style={styles.practiceSubtitle}>Making Practice Fun</Text>
      </View>

      <ScrollView contentContainerStyle={styles.practiceContent}>
        {/* Hero — MCQ Practice */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.heroCard}
          onPress={() => navigation.navigate('MCQ')}>
          <LinearGradient
            colors={['#3c8c89', '#2d5a5a']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.heroGradient}>
            <View style={styles.heroIconWrap}>
              <Icon name="assignment" size={28} color="#ffffff" />
            </View>
            <Text style={styles.heroCardTitle}>MCQ Practice</Text>
            <Text style={styles.heroCardSubtitle}>
              Test your knowledge with multiple choice questions
            </Text>
            <View style={styles.heroArrow}>
              <Icon name="arrow-forward" size={20} color="#ffffff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Short + Long Answers */}
        <View style={styles.miniCardRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.miniCard}
            onPress={() => navigation.navigate('ShortAnswersSelect')}>
            <View style={styles.miniIconWrap}>
              <Icon name="short-text" size={26} color="#2d5a5a" />
            </View>
            <Text style={styles.miniCardTitle}>Short{'\n'}Answers</Text>
            <Icon name="north_east" size={18} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.miniCard}
            onPress={() => navigation.navigate('LongAnswersSelect')}>
            <View style={styles.miniIconWrap}>
              <Icon name="article" size={26} color="#2d5a5a" />
            </View>
            <Text style={styles.miniCardTitle}>Long{'\n'}Answers</Text>
            <Icon name="north_east" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const LongAnswersSelect = ({navigation}) => {
  const subjects = useMemo(
    () => [...new Set(LONG_ANSWER_DATA.map(item => item.subject))],
    [],
  );
  const [subject, setSubject] = useState(subjects[0]);
  const chapters = useMemo(
    () => [
      ...new Set(
        LONG_ANSWER_DATA.filter(item => item.subject === subject).map(
          item => item.chapter,
        ),
      ),
    ],
    [subject],
  );
  const [chapter, setChapter] = useState(chapters[0] || '');
  const [difficulty, setDifficulty] = useState('Easy');
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [chapterOpen, setChapterOpen] = useState(false);
  const difficulties = ['Easy', 'Medium', 'Difficult'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2d3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Long Answers</Text>
        <View style={styles.backButton} />
      </View>
      <Text style={styles.subtitle}>Select subject, chapter and difficulty</Text>

      <View style={styles.formSection}>
        <DropdownSelector
          label="Select Subject"
          options={subjects}
          selected={subject}
          open={subjectOpen}
          onToggle={() => setSubjectOpen(prev => !prev)}
          onSelect={item => {
            setSubject(item);
            setChapter(
              LONG_ANSWER_DATA.find(q => q.subject === item)?.chapter || '',
            );
          }}
        />

        <DropdownSelector
          label="Select Chapter"
          options={chapters}
          selected={chapter}
          open={chapterOpen}
          onToggle={() => setChapterOpen(prev => !prev)}
          onSelect={item => setChapter(item)}
        />

        <View style={styles.difficultyGroup}>
          <Text style={styles.formLabel}>Difficulty</Text>
          <View style={styles.pillRow}>
            {difficulties.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.pill, difficulty === d && styles.pillActive]}
                onPress={() => setDifficulty(d)}
                activeOpacity={0.75}>
                <Text style={[styles.pillText, difficulty === d && styles.pillTextActive]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={() =>
            navigation.navigate('LongAnswersList', {
              subject,
              chapter,
              difficulty,
            })
          }>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const LongAnswersList = ({navigation, route}) => {
  const {subject, chapter, difficulty} = route.params || {};
  const filtered = LONG_ANSWER_DATA.filter(
    item =>
      item.subject === subject &&
      item.chapter === chapter &&
      item.difficulty === difficulty,
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2d3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Long Answers</Text>
        <View style={styles.backButton} />
      </View>
      <Text style={styles.subtitle}>Choose a question</Text>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {filtered.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.questionCard}
            onPress={() => navigation.navigate('LongAnswerDetail', {item})}>
            <View style={styles.questionCardContent}>
              <Text style={styles.questionCardText}>{item.question}</Text>
            </View>
            <Icon name="open_in_new" size={20} color="#2d3748" />
          </TouchableOpacity>
        ))}
        {filtered.length === 0 && (
          <Text style={styles.noResults}>No questions found for these selections.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const LongAnswerDetail = ({navigation, route}) => {
  const {item} = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2d3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Long Answers</Text>
        <View style={styles.backButton} />
      </View>
      <ScrollView contentContainerStyle={styles.detailContainer}>
        <View style={styles.detailCard}>
          <Text style={styles.detailQuestion}>{item.question}</Text>
          <View style={styles.detailAnswerWrapper}>
            <ScrollView style={styles.answerScroll}>
              <Text style={styles.detailAnswer}>{item.answer}</Text>
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ShortAnswersSelect = ({navigation}) => {
  const subjects = useMemo(
    () => [...new Set(SHORT_ANSWER_DATA.map(item => item.subject))],
    [],
  );
  const [subject, setSubject] = useState(subjects[0]);
  const chapters = useMemo(
    () => [
      ...new Set(
        SHORT_ANSWER_DATA.filter(item => item.subject === subject).map(
          item => item.chapter,
        ),
      ),
    ],
    [subject],
  );
  const [chapter, setChapter] = useState(chapters[0] || '');
  const [difficulty, setDifficulty] = useState('Easy');
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [chapterOpen, setChapterOpen] = useState(false);
  const difficulties = ['Easy', 'Medium', 'Difficult'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2d3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Short Answers</Text>
        <View style={styles.backButton} />
      </View>
      <Text style={styles.subtitle}>Select subject, chapter and difficulty</Text>

      <View style={styles.formSection}>
        <DropdownSelector
          label="Select Subject"
          options={subjects}
          selected={subject}
          open={subjectOpen}
          onToggle={() => setSubjectOpen(prev => !prev)}
          onSelect={item => {
            setSubject(item);
            setChapter(
              SHORT_ANSWER_DATA.find(q => q.subject === item)?.chapter || '',
            );
          }}
        />

        <DropdownSelector
          label="Select Chapter"
          options={chapters}
          selected={chapter}
          open={chapterOpen}
          onToggle={() => setChapterOpen(prev => !prev)}
          onSelect={item => setChapter(item)}
        />

        <View style={styles.difficultyGroup}>
          <Text style={styles.formLabel}>Difficulty</Text>
          <View style={styles.pillRow}>
            {difficulties.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.pill, difficulty === d && styles.pillActive]}
                onPress={() => setDifficulty(d)}
                activeOpacity={0.75}>
                <Text style={[styles.pillText, difficulty === d && styles.pillTextActive]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={() =>
            navigation.navigate('ShortAnswersList', {
              subject,
              chapter,
              difficulty,
            })
          }>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const ShortAnswersList = ({navigation, route}) => {
  const {subject, chapter, difficulty} = route.params || {};
  const filtered = SHORT_ANSWER_DATA.filter(
    item =>
      item.subject === subject &&
      item.chapter === chapter &&
      item.difficulty === difficulty,
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2d3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Short Answers</Text>
        <View style={styles.backButton} />
      </View>
      <Text style={styles.subtitle}>Choose a question</Text>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {filtered.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.questionCard}
            onPress={() => navigation.navigate('ShortAnswerDetail', {item})}>
            <View style={styles.questionCardContent}>
              <Text style={styles.questionCardText}>{item.question}</Text>
            </View>
            <Icon name="open_in_new" size={20} color="#2d3748" />
          </TouchableOpacity>
        ))}
        {filtered.length === 0 && (
          <Text style={styles.noResults}>No questions found for these selections.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const ShortAnswerDetail = ({navigation, route}) => {
  const {item} = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2d3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Short Answers</Text>
        <View style={styles.backButton} />
      </View>
      <ScrollView contentContainerStyle={styles.detailContainer}>
        <View style={styles.detailCard}>
          <Text style={styles.detailQuestion}>{item.question}</Text>
          <View style={styles.detailAnswerWrapper}>
            <ScrollView style={styles.answerScroll}>
              <Text style={styles.detailAnswer}>{item.answer}</Text>
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const PracticeScreen = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="PracticeHome" component={PracticeHome} />
      <Stack.Screen name="ShortAnswersSelect" component={ShortAnswersSelect} />
      <Stack.Screen name="ShortAnswersList" component={ShortAnswersList} />
      <Stack.Screen name="ShortAnswerDetail" component={ShortAnswerDetail} />
      <Stack.Screen name="LongAnswersSelect" component={LongAnswersSelect} />
      <Stack.Screen name="LongAnswersList" component={LongAnswersList} />
      <Stack.Screen name="LongAnswerDetail" component={LongAnswerDetail} />
      <Stack.Screen name="MCQ" component={MCQScreen} />
      <Stack.Screen name="ChapterDetail" component={ChapterDetailScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBFFF4',
  },
  practiceHeader: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
  },
  practiceTitle: {
    fontSize: 28,
    fontFamily: FONTS.heading,
    color: TEXT_COLORS.title,
  },
  practiceSubtitle: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: FONTS.body,
    color: TEXT_COLORS.subtitle,
  },
  practiceContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 6,
  },
  heroGradient: {
    padding: 28,
    minHeight: 190,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroCardTitle: {
    fontSize: 24,
    fontFamily: FONTS.headingBold,
    color: '#ffffff',
    marginBottom: 8,
  },
  heroCardSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  heroArrow: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniCardRow: {
    flexDirection: 'row',
    gap: 14,
  },
  miniCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    minHeight: 160,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  miniIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#dff0ea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  miniCardTitle: {
    fontSize: 16,
    fontFamily: FONTS.heading,
    color: TEXT_COLORS.title,
    lineHeight: 23,
    flex: 1,
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontFamily: FONTS.headingBold,
    color: TEXT_COLORS.title,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#8a9a9a',
    fontFamily: FONTS.body,
    marginBottom: 30,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  formLabel: {
    fontSize: 16,
    fontFamily: FONTS.heading,
    color: TEXT_COLORS.title,
    marginBottom: 12,
  },
  option: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  optionActive: {
    backgroundColor: '#e2f0ef',
    borderWidth: 1,
    borderColor: '#2d5a5a',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
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
  dropdownGroup: {
    marginBottom: 20,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  dropdownHeaderText: {
    fontSize: 15,
    color: '#334155',
    fontFamily: FONTS.body,
  },
  dropdownList: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    marginTop: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dropdownItemActive: {
    backgroundColor: '#e2f0ef',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#334155',
    fontFamily: FONTS.body,
  },
  dropdownItemTextActive: {
    fontSize: 15,
    color: '#0f172a',
    fontFamily: FONTS.heading,
  },
  difficultyGroup: {
    marginBottom: 20,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: '#2d5a5a',
    borderColor: '#2d5a5a',
  },
  pillText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: '#334155',
  },
  pillTextActive: {
    color: '#ffffff',
    fontFamily: FONTS.heading,
  },
  searchButton: {
    marginTop: 24,
    backgroundColor: '#2d5a5a',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: FONTS.heading,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  questionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  questionCardContent: {
    flex: 1,
    paddingRight: 12,
  },
  questionCardText: {
    fontSize: 15,
    fontFamily: FONTS.body,
    color: '#1f2937',
    lineHeight: 22,
  },
  noResults: {
    marginTop: 50,
    textAlign: 'center',
    color: '#64748b',
    fontFamily: FONTS.body,
    fontSize: 15,
  },
  detailContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  detailCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 22,
    marginTop: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  detailQuestion: {
    fontSize: 18,
    fontFamily: FONTS.heading,
    color: '#111827',
    marginBottom: 18,
  },
  detailAnswerWrapper: {
    maxHeight: 420,
  },
  answerScroll: {
    paddingRight: 8,
  },
  detailAnswer: {
    fontSize: 15,
    lineHeight: 24,
    color: '#334155',
    fontFamily: FONTS.body,
  },
});

export default PracticeScreen;
