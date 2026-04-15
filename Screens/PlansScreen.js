import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FONTS} from '../lib/fonts';

const FREE_FEATURES = [
  {
    section: 'PAPERS & QUESTIONS',
    items: [
      {title: 'Past year papers', sub: 'Last 3 years'},
      {title: 'CBSE sample papers', sub: 'Latest 3 papers'},
      {title: 'Practice MCQs', sub: '30/day · any chapter · with answers + explanations'},
      {title: 'Short answers', sub: '3 chapters free (any subject)'},
      {title: 'Long answers', sub: 'First paragraph of every answer'},
      {title: 'Question format labels', sub: '1-mark / 3-mark / 5-mark · first 30 Qs'},
    ],
  },
  {
    section: 'PROGRESS',
    items: [
      {title: 'Score history', sub: 'Last 5 tests'},
      {title: 'Self-assessment', sub: 'Fully / Partially / Missed marking'},
      {title: 'Daily streak tracker', sub: null},
      {title: 'Referral reward', sub: '3 days Premium per friend (friend must use app 3 days)'},
    ],
  },
];

const PREMIUM_FEATURES = [
  {
    section: 'PAPERS & QUESTIONS',
    items: [
      {title: 'Past year papers — full 10-year archive', sub: null},
      {title: 'All CBSE sample papers', sub: null},
      {title: 'Unlimited MCQs', sub: 'All chapters · all subjects'},
      {title: 'Full short + long answer bank', sub: 'All chapters · all subjects · keywords highlighted + structure breakdown'},
      {title: 'Full 10-year quiz bank', sub: 'Scored · chapter-wise questions across all years'},
      {title: 'Timed tests from past papers', sub: 'Full scored test · actual exam format'},
      {title: 'Difficulty scaling', sub: 'Easy · Moderate · Actual exam difficulty toggle'},
      {title: 'Model question papers', sub: 'Purchasable · scores tracked in progress'},
    ],
  },
  {
    section: 'AI FEATURES',
    items: [
      {title: 'AI essay grader', sub: 'Type your answer · AI grades it against model answer'},
      {title: 'AI question generation', sub: '50 AI Qs/day · exact syllabus + chapter targeting'},
      {title: 'Syllabus deep-dive', sub: 'AI generates Qs for your weak sub-topics specifically'},
      {title: 'AI question top-up', sub: '₹29 for 100 extra AI Qs if daily limit hit'},
    ],
  },
  {
    section: 'ANALYTICS & PROGRESS',
    items: [
      {title: 'Full performance dashboard', sub: 'Weak topics · accuracy trends · time per question'},
      {title: 'Self-assessment with history', sub: 'Flags and checks repeated weak spots'},
      {title: 'Full streak history', sub: 'Chapter-level detail · time studied · accuracy over time'},
      {title: 'Referral reward', sub: '1 full month free for every friend who converts to Ace'},
    ],
  },
];

const FeatureItem = ({title, sub, dark}) => (
  <View style={styles.featureRow}>
    <Icon
      name="check"
      size={16}
      color={dark ? '#facc15' : '#22c55e'}
      style={styles.featureCheck}
    />
    <View style={styles.featureText}>
      <Text style={[styles.featureTitle, dark && styles.featureTitleDark]}>{title}</Text>
      {sub ? (
        <Text style={[styles.featureSub, dark && styles.featureSubDark]}>{sub}</Text>
      ) : null}
    </View>
  </View>
);

const PlansScreen = ({navigation}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose your plan</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.pageSubtitle}>
          Start free. Upgrade when you're ready to go deeper.
        </Text>

        {/* FREE CARD */}
        <View style={styles.freeCard}>
          <Text style={styles.planBadge}>FREE</Text>
          <Text style={styles.planName}>Free</Text>
          <Text style={styles.planPrice}>
            ₹0{' '}
            <Text style={styles.planPriceSub}>forever</Text>
          </Text>
          <Text style={styles.planTagline}>Build the habit. Get the basics right.</Text>

          <TouchableOpacity style={styles.currentPlanBtn} activeOpacity={0.8}>
            <Text style={styles.currentPlanBtnText}>Current plan</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {FREE_FEATURES.map(group => (
            <View key={group.section}>
              <Text style={styles.sectionLabel}>{group.section}</Text>
              {group.items.map((item, i) => (
                <FeatureItem key={i} title={item.title} sub={item.sub} dark={false} />
              ))}
            </View>
          ))}
        </View>

        {/* PREMIUM CARD */}
        <View style={styles.premiumCard}>
          <View style={styles.popularBadgeRow}>
            <View style={styles.popularBadge}>
              <Icon name="star" size={12} color="#facc15" />
              <Text style={styles.popularBadgeText}>Most popular</Text>
            </View>
          </View>

          <Text style={styles.planBadgeDark}>PREMIUM</Text>
          <Text style={styles.planNameDark}>Ace</Text>
          <Text style={styles.planPriceDark}>
            ₹299{' '}
            <Text style={styles.planPriceSubDark}>/ month</Text>
          </Text>
          <Text style={styles.planTaglineDark}>
            Everything you need to top your boards.
          </Text>

          <TouchableOpacity style={styles.upgradeBtn} activeOpacity={0.85}>
            <Text style={styles.upgradeBtnText}>Upgrade to Ace</Text>
          </TouchableOpacity>

          <Text style={styles.everythingLabel}>EVERYTHING IN FREE, PLUS</Text>

          {PREMIUM_FEATURES.map(group => (
            <View key={group.section}>
              <Text style={styles.sectionLabelDark}>{group.section}</Text>
              {group.items.map((item, i) => (
                <FeatureItem key={i} title={item.title} sub={item.sub} dark={true} />
              ))}
            </View>
          ))}
        </View>

        <View style={{height: 32}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EBF4FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#EBF4FF',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: FONTS.headingBold,
    color: '#1f2937',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  pageSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },

  // FREE CARD
  freeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2eaf5',
    padding: 20,
    marginBottom: 16,
  },
  planBadge: {
    fontSize: 11,
    fontFamily: FONTS.headingBold,
    color: '#64748b',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  planName: {
    fontSize: 28,
    fontFamily: FONTS.headingBold,
    color: '#1f2937',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 26,
    fontFamily: FONTS.headingBold,
    color: '#1f2937',
    marginBottom: 4,
  },
  planPriceSub: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: '#64748b',
  },
  planTagline: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: '#64748b',
    marginBottom: 16,
  },
  currentPlanBtn: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  currentPlanBtnText: {
    fontSize: 14,
    fontFamily: FONTS.headingBold,
    color: '#1f2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2eaf5',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: FONTS.headingBold,
    color: '#94a3b8',
    letterSpacing: 1.2,
    marginTop: 14,
    marginBottom: 10,
  },

  // PREMIUM CARD
  premiumCard: {
    backgroundColor: '#162040',
    borderRadius: 16,
    padding: 20,
  },
  popularBadgeRow: {
    marginBottom: 10,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(250,204,21,0.15)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 4,
  },
  popularBadgeText: {
    fontSize: 11,
    fontFamily: FONTS.headingBold,
    color: '#facc15',
  },
  planBadgeDark: {
    fontSize: 11,
    fontFamily: FONTS.headingBold,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  planNameDark: {
    fontSize: 28,
    fontFamily: FONTS.headingBold,
    color: '#ffffff',
    marginBottom: 4,
  },
  planPriceDark: {
    fontSize: 26,
    fontFamily: FONTS.headingBold,
    color: '#ffffff',
    marginBottom: 4,
  },
  planPriceSubDark: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: 'rgba(255,255,255,0.55)',
  },
  planTaglineDark: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 16,
  },
  upgradeBtn: {
    backgroundColor: '#1e4080',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 20,
  },
  upgradeBtnText: {
    fontSize: 14,
    fontFamily: FONTS.headingBold,
    color: '#ffffff',
  },
  everythingLabel: {
    fontSize: 10,
    fontFamily: FONTS.headingBold,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  sectionLabelDark: {
    fontSize: 10,
    fontFamily: FONTS.headingBold,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.2,
    marginTop: 14,
    marginBottom: 10,
  },

  // Feature rows
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  featureCheck: {
    marginTop: 2,
    marginRight: 10,
    width: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: '#1f2937',
    lineHeight: 18,
  },
  featureTitleDark: {
    color: '#ffffff',
  },
  featureSub: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: '#94a3b8',
    lineHeight: 16,
    marginTop: 1,
  },
  featureSubDark: {
    color: 'rgba(255,255,255,0.45)',
  },
});

export default PlansScreen;
