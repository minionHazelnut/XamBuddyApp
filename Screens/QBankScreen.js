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
const FALLBACK_PAST_YEAR = ['2023-24', '2022-23', '2021-22', '2020-21'];
const FALLBACK_SAMPLE_PAPERS = ['2024', '2023', '2022', '2021'];

const parsePaperYear = year => {
  if (!year) return 0;
  const yearString = String(year).trim();
  const match = yearString.match(/(\d{4})/g);
  if (!match?.length) return 0;
  return Math.max(...match.map(num => Number(num)));
};

const sortPapers = papers => {
  return papers.slice().sort((a, b) => {
    const aYear = parsePaperYear(a.year);
    const bYear = parsePaperYear(b.year);
    if (aYear !== bYear) return bYear - aYear;
    if (a.created_at && b.created_at) {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    return 0;
  });
};

const getFallbackItems = category => {
  const fallbackYears = category === 'sample_papers' ? FALLBACK_SAMPLE_PAPERS : FALLBACK_PAST_YEAR;
  return fallbackYears.map(year => ({year, title: `${year} paper`, url: null}));
};

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
        console.warn('Paper fetch error:', error);
        setPapers([]);
      } else {
        setPapers(sortPapers(data || []));
      }
    } catch (err) {
      console.warn('Paper fetch exception:', err);
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
    Alert.alert('Coming soon', 'This paper will be available shortly. Check back once it\'s uploaded.');
  };

  const hasRealPapers = papers.length > 0;
  const items = hasRealPapers ? papers : getFallbackItems(activeCategory);

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
        ) : (
          <>
            {!hasRealPapers && (
              <View style={styles.comingSoonBanner}>
                <Icon name="schedule" size={18} color="#4a6a6a" />
                <Text style={styles.comingSoonText}>
                  Papers will appear here as soon as they're added to your library.
                </Text>
              </View>
            )}
            {items.map((paper, index) => (
              <TouchableOpacity
                key={`${paper.year}-${index}`}
                style={[styles.paperCard, !paper.url && styles.paperCardPlaceholder]}
                onPress={() => handleOpenPaper(paper)}
                activeOpacity={paper.url ? 0.8 : 0.6}
              >
                <View style={styles.cardLeft}>
                  <Text style={[styles.paperYear, !paper.url && styles.paperYearPlaceholder]}>
                    {paper.year}
                  </Text>
                  <Text style={[styles.paperTitle, !paper.url && styles.paperTitlePlaceholder]}>
                    {paper.url ? paper.title : 'Coming soon'}
                  </Text>
                </View>
                <View style={[styles.statusBadge, paper.url ? styles.statusBadgeReady : styles.statusBadgeSoon]}>
                  <Icon
                    name={paper.url ? 'open-in-new' : 'hourglass-empty'}
                    size={16}
                    color={paper.url ? '#2d5a5a' : '#718096'}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBFFF4',
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
    marginBottom: 12,
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
    backgroundColor: '#3c8c89',
    borderColor: '#3c8c89',
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
});

export default QBankScreen;
