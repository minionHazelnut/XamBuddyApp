import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {supabase} from '../lib/supabase';

const FILTERS = ['All', 'Resume', 'Finished', 'Saved', 'Free'];

const ProgressCircle = ({progress}) => {
  if (progress === 100) {
    return (
      <View style={circleStyles.completedBadge}>
        <Icon name="verified" size={36} color="#4CAF50" />
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
    fontWeight: '600',
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

  useEffect(() => {
    fetchSubjectsAndChapters();
  }, []);

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
        {/* Subject dropdown */}
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

        {/* Chapter sections */}
        {Object.entries(sections).map(([sectionName, sectionChapters]) => (
          <View key={sectionName} style={styles.section}>
            {/* Section divider */}
            <View style={styles.sectionDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.sectionTitle}>{sectionName}</Text>
              <View style={[styles.dividerLine, {flex: 2}]} />
            </View>

            {/* Chapter cards */}
            {sectionChapters.map((chapter, index) => (
              <TouchableOpacity key={index} style={styles.chapterCard}>
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
    color: '#2d3748',
    fontWeight: '300',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 24,
  },
  filterText: {
    fontSize: 16,
    color: '#8a9a9a',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#2d3748',
    fontWeight: '700',
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
    color: '#2d3748',
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
    color: '#6a7a7a',
    fontWeight: '500',
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
    color: '#2d3748',
    fontWeight: '500',
  },
  chapterCount: {
    fontSize: 13,
    color: '#8a9a9a',
    marginTop: 4,
  },
});

export default MCQScreen;
