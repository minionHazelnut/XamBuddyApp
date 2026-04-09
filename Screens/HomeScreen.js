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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top section: gray-green background with QotD */}
        <View style={styles.topSection}>
          {/* Decorative lines — #FFFFFF 20% opacity, weight 1 */}
          <View style={styles.decorativeLine1} />
          <View style={styles.decorativeLine2} />

          {/* Mint green blob behind cards — #EBFFF4 with blur */}
          <View style={styles.mintBlob} />

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

          {/* Panel with gradient — top-left radius 70 */}
          <View style={styles.whitePanelWrapper}>
            <LinearGradient
              colors={['#ffffff', '#EBFFF4']}
              start={{x: 0.5, y: 0}}
              end={{x: 0.5, y: 1}}
              style={styles.whitePanel}
            />
          </View>
        </View>

        {/* Bottom section: gradient background with cards */}
        <LinearGradient
          colors={['#f2fdf7', '#EBFFF4']}
          style={styles.bottomSection}>
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
        </LinearGradient>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBFFF4',
  },
  topSection: {
    backgroundColor: '#5e7070',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
    overflow: 'hidden',
  },
  // Decorative line 1 — long curved arc, rotation ~-127deg
  decorativeLine1: {
    position: 'absolute',
    top: -80,
    left: -100,
    width: 500,
    height: 420,
    borderRadius: 210,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    transform: [{rotate: '-30deg'}],
  },
  // Decorative line 2 — crossing arc
  decorativeLine2: {
    position: 'absolute',
    top: -40,
    left: 50,
    width: 350,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    transform: [{rotate: '40deg'}],
  },
  // Mint blob — #EBFFF4 blurred behind the cards area
  mintBlob: {
    position: 'absolute',
    bottom: -80,
    left: -40,
    width: 400,
    height: 350,
    borderRadius: 180,
    backgroundColor: 'rgba(235,255,244,0.35)',
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
    shadowOpacity: 0.15,
    shadowRadius: 8,
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
  whitePanelWrapper: {
    marginHorizontal: -20,
    height: 60,
    borderTopLeftRadius: 70,
    overflow: 'hidden',
    zIndex: 1,
  },
  whitePanel: {
    flex: 1,
  },
  bottomSection: {
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
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
