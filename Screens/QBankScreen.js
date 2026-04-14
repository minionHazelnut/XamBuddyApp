import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {supabase} from '../lib/supabase';
import {FONTS, TEXT_COLORS} from '../lib/fonts';

const CATEGORIES = [
  {key: 'past_year_papers', label: 'Past year papers'},
  {key: 'sample_papers', label: 'Sample papers'},
];
const FALLBACK_YEARS = ['2023-24', '2022-23', '2021-22', '2020-21'];

const QBankScreen = () => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].key);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPapers();
  }, [activeCategory]);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const {data, error} = await supabase
        .from('papers')
        .select('*')
        .eq('category', activeCategory)
        .order('year', {ascending: false});

      if (error) {
        setPapers([]);
      } else {
        setPapers(data || []);
      }
    } catch (err) {
      setPapers([]);
    }
    setLoading(false);
  };

  const handleOpenPaper = async paper => {
    if (paper?.url) {
      const supported = await Linking.canOpenURL(paper.url);
      if (supported) {
        await Linking.openURL(paper.url);
        return;
      }
    }

    Alert.alert(
      'Paper unavailable',
      'This paper is not uploaded yet. Add a URL to the paper record in your Supabase `papers` table.',
    );
  };

  const items = papers.length > 0 ? papers : FALLBACK_YEARS.map(year => ({year, title: `${year} paper`, url: null}));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>QBank</Text>
        <Text style={styles.subtitle}>Past Year & Sample Papers</Text>
      </View>

      <View style={styles.filterRow}>
        {CATEGORIES.map(item => {
          const selected = activeCategory === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => setActiveCategory(item.key)}
              style={[styles.filterButton, selected && styles.filterButtonActive]}>
              <Text style={[styles.filterButtonText, selected && styles.filterButtonTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#4a6a6a" />
            <Text style={styles.infoText}>Loading papers...</Text>
          </View>
        ) : items.length > 0 ? (
          items.map((paper, index) => (
            <TouchableOpacity
              key={`${paper.year}-${index}`}
              style={styles.paperCard}
              onPress={() => handleOpenPaper(paper)}
              activeOpacity={0.8}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.paperYear}>{paper.year}</Text>
                <Text style={styles.paperTitle}>{paper.title}</Text>
              </View>
              <Icon
                name={paper.url ? 'open-in-new' : 'cloud-upload'}
                size={24}
                color={paper.url ? '#2d3748' : '#718096'}
              />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.centered}>
            <Text style={styles.infoText}>No papers uploaded yet for this category.</Text>
          </View>
        )}
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF4FF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 26,
    fontFamily: FONTS.heading,
    color: TEXT_COLORS.title,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: FONTS.body,
    color: TEXT_COLORS.subtitle,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 40,
    gap: 10,
  },
  filterButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
  },
  filterButtonActive: {
    backgroundColor: '#1e4080',
    borderColor: '#1e4080',
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: TEXT_COLORS.title,
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  paperCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardLeft: {
    flex: 1,
  },
  paperYear: {
    fontSize: 16,
    fontFamily: FONTS.headingBold,
    color: '#2d3748',
    marginBottom: 6,
  },
  paperTitle: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: TEXT_COLORS.subtitle,
  },
  centered: {
    padding: 32,
    alignItems: 'center',
  },
  infoText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: FONTS.body,
    color: TEXT_COLORS.subtitle,
    textAlign: 'center',
  },
  comingSoonBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0faf6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#c6e8db',
  },
  comingSoonText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.body,
    color: '#4a6a6a',
    lineHeight: 18,
  },
  paperCardPlaceholder: {
    backgroundColor: '#f8fafb',
    shadowOpacity: 0.04,
    elevation: 1,
  },
  paperYearPlaceholder: {
    color: '#94a3b8',
  },
  paperTitlePlaceholder: {
    color: '#b0bec5',
    fontStyle: 'italic',
  },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadgeReady: {
    backgroundColor: '#dff0ea',
  },
  statusBadgeSoon: {
    backgroundColor: '#f1f5f9',
  },
  errorText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: '#e53e3e',
    textAlign: 'center',
  },
  noteBox: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  noteTitle: {
    fontSize: 14,
    fontFamily: FONTS.headingBold,
    color: '#2d3748',
    marginBottom: 6,
  },
  noteText: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: TEXT_COLORS.subtitle,
    lineHeight: 18,
  },
});

export default QBankScreen;
