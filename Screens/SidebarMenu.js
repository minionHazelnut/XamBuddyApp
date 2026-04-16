import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {supabase} from '../lib/supabase';
import {FONTS} from '../lib/fonts';

const WINDOW = Dimensions.get('window');
const SIDEBAR_WIDTH = WINDOW.width * 0.72;

const SidebarMenu = ({navigation, iconColor = '#1e4080', buttonStyle}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const sidebarX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const handleModalShow = () => {
    Animated.parallel([
      Animated.timing(sidebarX, {toValue: 0, duration: 280, useNativeDriver: true}),
      Animated.timing(overlayOpacity, {toValue: 1, duration: 280, useNativeDriver: true}),
    ]).start();
  };

  const closeMenu = callback => {
    Animated.parallel([
      Animated.timing(sidebarX, {toValue: -SIDEBAR_WIDTH, duration: 240, useNativeDriver: true}),
      Animated.timing(overlayOpacity, {toValue: 0, duration: 240, useNativeDriver: true}),
    ]).start(() => {
      setMenuVisible(false);
      callback?.();
    });
  };

  const openMenu = () => {
    sidebarX.setValue(-SIDEBAR_WIDTH);
    overlayOpacity.setValue(0);
    setMenuVisible(true);
  };

  const handleLogoutPress = () => {
    closeMenu(() => setLogoutConfirmVisible(true));
  };

  const confirmLogout = async () => {
    setLogoutConfirmVisible(false);
    await supabase.auth.signOut();
  };

  return (
    <>
      <TouchableOpacity
        onPress={openMenu}
        style={[styles.hamburgerButton, buttonStyle]}>
        <Icon name="menu" size={26} color={iconColor} />
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onShow={handleModalShow}
        onRequestClose={() => closeMenu()}>
        <View style={styles.sidebarContainer}>
          <TouchableWithoutFeedback onPress={() => closeMenu()}>
            <Animated.View style={[styles.overlay, {opacity: overlayOpacity}]} />
          </TouchableWithoutFeedback>
          <Animated.View
            style={[styles.sidebar, {transform: [{translateX: sidebarX}]}]}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Menu</Text>
              <TouchableOpacity
                onPress={() => closeMenu()}
                style={styles.sidebarCloseBtn}>
                <Icon name="close" size={22} color="#1e4080" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={() => closeMenu(() => navigation.navigate('Profile'))}>
              <Text style={styles.sidebarText}>Profile settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={() =>
                closeMenu(() =>
                  navigation.navigate('Home', {screen: 'Plans'}),
                )
              }>
              <Text style={styles.sidebarText}>Premium plans</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={() =>
                closeMenu(() =>
                  navigation.navigate('Home', {screen: 'Suggestions'}),
                )
              }>
              <Text style={styles.sidebarText}>Suggestions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={handleLogoutPress}>
              <Text style={styles.sidebarTextLogout}>Log out</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      <Modal
        visible={logoutConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutConfirmVisible(false)}>
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setLogoutConfirmVisible(false)}>
                <Text style={styles.confirmButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonPrimary]}
                onPress={confirmLogout}>
                <Text
                  style={[
                    styles.confirmButtonText,
                    styles.confirmButtonTextPrimary,
                  ]}>
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  hamburgerButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  sidebarContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#EBF4FF',
    paddingTop: 60,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 0},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sidebarTitle: {
    fontSize: 24,
    fontFamily: FONTS.heading,
    color: '#1e4080',
  },
  sidebarCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(30,64,128,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#c7d9f0',
  },
  sidebarText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: '#1e4080',
  },
  sidebarTextLogout: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: '#e53e3e',
  },
  confirmOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  confirmBox: {
    width: '82%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  confirmTitle: {
    fontSize: 18,
    fontFamily: FONTS.heading,
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  confirmButtonPrimary: {
    backgroundColor: '#e53e3e',
  },
  confirmButtonText: {
    fontSize: 15,
    fontFamily: FONTS.body,
    color: '#111827',
  },
  confirmButtonTextPrimary: {
    color: '#ffffff',
  },
});

export default SidebarMenu;
