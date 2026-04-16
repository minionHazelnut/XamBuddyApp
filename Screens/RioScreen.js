import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FONTS, TEXT_COLORS} from '../lib/fonts';
import SidebarMenu from './SidebarMenu';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'ai',
  text: "Hi! I'm Rio, your AI study buddy. Ask me anything about your subjects and I'll help you understand.",
};

const RioScreen = ({navigation}) => {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({animated: true});
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) {return;}

    const userMsg = {id: String(Date.now()), role: 'user', text: trimmed};
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const aiMsg = {
        id: String(Date.now()) + '_ai',
        role: 'ai',
        text: "I'm still learning! Full AI responses coming soon.",
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 600);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SidebarMenu navigation={navigation} iconColor="#1e4080" />
        <View style={styles.avatarWrap}>
          <Icon name="auto_awesome" size={20} color="#ffffff" />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Rio</Text>
          <Text style={styles.headerSub}>AI Study Buddy</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}>
          {messages.map(msg => (
            <View
              key={msg.id}
              style={msg.role === 'user' ? styles.userRow : styles.aiRow}>
              {msg.role === 'ai' && (
                <View style={styles.aiBubbleAvatar}>
                  <Icon name="auto_awesome" size={14} color="#1e4080" />
                </View>
              )}
              <View
                style={[
                  styles.bubble,
                  msg.role === 'user' ? styles.userBubble : styles.aiBubble,
                ]}>
                <Text
                  style={
                    msg.role === 'user'
                      ? styles.userBubbleText
                      : styles.aiBubbleText
                  }>
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask Rio anything..."
            placeholderTextColor="#94a3b8"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            activeOpacity={0.8}
            disabled={!input.trim()}>
            <Icon name="send" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#EBF4FF',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2eaf5',
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e4080',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextWrap: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.headingBold,
    color: TEXT_COLORS.title,
  },
  headerSub: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: '#64748b',
    marginTop: 1,
  },
  messageList: {
    flex: 1,
  },
  messageContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  aiBubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#dde8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  aiBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#1e4080',
    borderBottomRightRadius: 4,
  },
  aiBubbleText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1f2937',
    fontFamily: FONTS.body,
  },
  userBubbleText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#ffffff',
    fontFamily: FONTS.body,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2eaf5',
  },
  input: {
    flex: 1,
    backgroundColor: '#EBF4FF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    fontFamily: FONTS.body,
    color: '#1f2937',
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#c7d9f0',
    marginRight: 10,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1e4080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
});

export default RioScreen;
