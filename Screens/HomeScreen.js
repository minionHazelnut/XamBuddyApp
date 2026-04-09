import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Question of the Day Card */}
        <View style={styles.featuredCardWrapper}>
          <LinearGradient
            colors={['#c8f0df', '#e8f8f0']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.featuredGradient}>
            <Text style={styles.featuredCardTitle}>
              Question Of The{'\n'}Day!
            </Text>
          </LinearGradient>
        </View>

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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a3a3a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  featuredCardWrapper: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  featuredGradient: {
    flex: 1,
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
  cardRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  trackCard: {
    flex: 1.2,
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  trackCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    lineHeight: 22,
  },
  streakCard: {
    flex: 0.8,
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
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
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
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
