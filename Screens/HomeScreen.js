import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top section: gray-green background with QotD */}
        <View style={styles.topSection}>
          {/* Decorative crossing lines */}
          <View style={styles.horizontalLine} />
          <View style={styles.verticalLine} />

          {/* Question of the Day Card */}
          <View style={styles.featuredCardOuter}>
            <View style={styles.featuredCardWrapper}>
              <View style={styles.featuredCard}>
              <Text style={styles.featuredCardTitle}>
                Question Of The{'\n'}Day!
              </Text>
              </View>
            </View>
          </View>

          {/* White panel that overlaps behind QotD */}
          <View style={styles.whitePanel} />
        </View>

        {/* Bottom section: light background with cards */}
        <View style={styles.bottomSection}>
          {/* Row: Track Progress + Streak */}
          <View style={styles.cardRow}>
            <TouchableOpacity style={styles.trackCard}>
              <Text style={styles.trackCardTitle}>
                Track your{'\n'}progress
              </Text>
              <View style={styles.arrowContainer}>
                <Icon name="north-east" size={22} color="#4a5568" />
              </View>
            </TouchableOpacity>

            <View style={styles.streakCard}>
              <Text style={styles.streakLabel}>Streak</Text>
              <Text style={styles.streakNumber}>12</Text>
            </View>
          </View>

          {/* Before Exam Card */}
          <TouchableOpacity style={styles.examCard}>
            <Text style={styles.examCardTitle}>
              Before Exam{'\n'}Formulas, Theorems &{'\n'}Diagrams
            </Text>
            <View style={styles.arrowContainer}>
              <Icon name="north-east" size={22} color="#4a5568" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8ebe9',
  },
  topSection: {
    backgroundColor: '#6b7c7c',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
    overflow: 'hidden',
  },
  horizontalLine: {
    position: 'absolute',
    top: 60,
    left: -40,
    right: -40,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
    transform: [{rotate: '-3deg'}],
  },
  verticalLine: {
    position: 'absolute',
    top: -20,
    left: '40%',
    width: 1,
    height: 140,
    backgroundColor: 'rgba(255,255,255,0.4)',
    transform: [{rotate: '8deg'}],
  },
  featuredCardOuter: {
    alignItems: 'center',
    marginBottom: -40,
    zIndex: 2,
  },
  featuredCardWrapper: {
    width: '70%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  featuredCard: {
    height: 160,
    borderRadius: 16,
    backgroundColor: '#dff0ea',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  featuredCardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    textAlign: 'center',
  },
  whitePanel: {
    backgroundColor: '#e8ebe9',
    height: 60,
    borderTopLeftRadius: 30,
    marginHorizontal: -20,
    zIndex: 1,
  },
  bottomSection: {
    backgroundColor: '#e8ebe9',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 40,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  trackCard: {
    flex: 1.2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  trackCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    lineHeight: 22,
  },
  streakCard: {
    flex: 0.8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 4,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  examCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  examCardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    lineHeight: 22,
  },
  arrowContainer: {
    marginLeft: 12,
  },
});

export default HomeScreen;
