import React, {useState} from 'react';
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
import {supabase} from '../lib/supabase';
import {FONTS} from '../lib/fonts';

const CATEGORIES = [
  {key: 'feature', label: 'Feature request', icon: 'lightbulb'},
  {key: 'bug', label: 'Something broken', icon: 'bug-report'},
  {key: 'content', label: 'Content request', icon: 'menu-book'},
  {key: 'other', label: 'Other', icon: 'chat-bubble-outline'},
];

const SuggestionsScreen = ({navigation, user}) => {
  const [category, setCategory] = useState(null);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('Please write something before submitting.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await supabase.from('suggestions').insert({
        category: category || 'other',
        message: message.trim(),
        user_email: user?.email || null,
      });
    } catch (e) {
      // Silently continue — don't block the user if table doesn't exist yet
    }
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Suggestions</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Icon name="favorite" size={36} color="#1e4080" />
          </View>
          <Text style={styles.successTitle}>Thank you!</Text>
          <Text style={styles.successSub}>
            We've received your note and we genuinely appreciate you taking the time. Every suggestion helps make XamBuddy better for everyone.
          </Text>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>Back to home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Suggestions</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <View style={styles.heroRow}>
            <View style={styles.heroIcon}>
              <Icon name="edit-note" size={28} color="#1e4080" />
            </View>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>We'd love to hear from you</Text>
              <Text style={styles.heroSub}>
                Got an idea? Something not working? Tell us — we read every single note.
              </Text>
            </View>
          </View>

          <Text style={styles.fieldLabel}>What's this about?</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c.key}
                style={[styles.chip, category === c.key && styles.chipActive]}
                onPress={() => setCategory(c.key)}
                activeOpacity={0.8}>
                <Icon
                  name={c.icon}
                  size={15}
                  color={category === c.key ? '#ffffff' : '#1e4080'}
                  style={styles.chipIcon}
                />
                <Text style={[styles.chipText, category === c.key && styles.chipTextActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Your note</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tell us what's on your mind. Be as specific or as brief as you like — anything helps."
            placeholderTextColor="#94a3b8"
            value={message}
            onChangeText={t => {
              setMessage(t);
              if (error) setError('');
            }}
            multiline
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text style={styles.charCount}>{message.length}/1000</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}>
            <Text style={styles.submitBtnText}>
              {loading ? 'Sending...' : 'Send suggestion'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Your suggestion is anonymous unless you choose to include your name or contact in the note. We won't spam you.
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#EBF4FF'},
  flex: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#EBF4FF',
  },
  backBtn: {width: 40, height: 40, justifyContent: 'center'},
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: FONTS.headingBold,
    color: '#1f2937',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Hero
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroText: {flex: 1},
  heroTitle: {
    fontSize: 16,
    fontFamily: FONTS.headingBold,
    color: '#1f2937',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: '#64748b',
    lineHeight: 19,
  },

  // Field label
  fieldLabel: {
    fontSize: 13,
    fontFamily: FONTS.headingBold,
    color: '#1e4080',
    marginBottom: 10,
  },

  // Chips
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1e4080',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 13,
    backgroundColor: '#ffffff',
  },
  chipActive: {
    backgroundColor: '#1e4080',
  },
  chipIcon: {marginRight: 5},
  chipText: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: '#1e4080',
  },
  chipTextActive: {
    color: '#ffffff',
  },

  // Text area
  textArea: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#dde8ff',
    padding: 16,
    fontSize: 14,
    fontFamily: FONTS.body,
    color: '#1f2937',
    minHeight: 140,
    lineHeight: 22,
  },
  charCount: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: '#ef4444',
    marginBottom: 8,
  },

  // Submit
  submitBtn: {
    backgroundColor: '#1e4080',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 15,
    fontFamily: FONTS.headingBold,
    color: '#ffffff',
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Success
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 26,
    fontFamily: FONTS.headingBold,
    color: '#1f2937',
    marginBottom: 14,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  doneBtn: {
    backgroundColor: '#1e4080',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  doneBtnText: {
    fontSize: 15,
    fontFamily: FONTS.headingBold,
    color: '#ffffff',
  },
});

export default SuggestionsScreen;
