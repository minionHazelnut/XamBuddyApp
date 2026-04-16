# XamBuddyRN Project Structure

Project: XamBuddyRN
Type: React Native exam prep app
Platform: iOS and Android

## Key structure

- Root: `App.js` (auth, session restore, tab navigator, custom tab bar), `index.js`, `app.json`, `babel.config.js`, `metro.config.js`
- `Screens/`: all app screens (see list below)
- `lib/`: shared utilities — `supabase.js`, `fonts.js`, `streak.js`
- `android/` / `ios/`: native project files
- `assets/` / `Images/`: app assets and icons
- `docs/`: this folder

## Screens inventory

| File | Status | Notes |
|------|--------|-------|
| `HomeScreen.js` | ✅ Done | QOTD, dynamic streak, referral card, sidebar menu (Profile settings / Plans / Suggestions / Log out) |
| `ProgressScreen.js` | ✅ Done | 3-day bar chart, week dot calendar, View Full Analysis button |
| `ProfileScreen.js` | ✅ Done | Real stats (avg accuracy, Qs answered, tests taken), dynamic streak + week dots, weak areas, subject coverage (hardcoded subjects) |
| `QBankScreen.js` | ✅ Done | Past year papers + sample papers from Supabase `papers` table |
| `PracticeScreen.js` | ✅ Done | Nested stack hub; MCQ hero card, short answers card, long answers card |
| `MCQScreen.js` | ✅ Done | Chapter browser (from Supabase), All / Resume / Finished / Saved filter tabs wired to AsyncStorage |
| `ChapterDetailScreen.js` | ✅ Done | Difficulty selector (Mixed default), question count picker, Start Quiz |
| `QuizScreen.js` | ✅ Done | MCQ quiz, per-question bookmarks, in-progress save/restore, session history, Mixed difficulty, streak mark on finish |
| `RioScreen.js` | 🔶 UI done | Chat UI complete; AI responses are placeholder ("I'm still learning!") — real AI not wired |
| `PlansScreen.js` | ✅ Done | Free vs Premium pricing cards with full feature lists |
| `SuggestionsScreen.js` | ✅ Done | Category chips, text area, saves to Supabase `suggestions` table, thank-you state |

## Shared libraries

| File | Purpose |
|------|---------|
| `lib/supabase.js` | Supabase client with AsyncStorage session persistence, AppState-driven token refresh |
| `lib/fonts.js` | Font name constants (`FONTS.*`, `TEXT_COLORS.*`) |
| `lib/streak.js` | `getLocalDateKey`, `markStreakDay`, `loadStreakDays`, `computeStreak` — shared across HomeScreen, QuizScreen, ProfileScreen |

## AsyncStorage keys

| Key | Written by | Read by |
|-----|-----------|--------|
| `quizProgressHistory` | QuizScreen (on finish) | ProgressScreen, ProfileScreen |
| `quizTestsCount` | QuizScreen (on finish) | ProfileScreen |
| `quizSessions` | QuizScreen (on finish) | MCQScreen (Finished tab) |
| `quizInProgress` | QuizScreen (on back-navigate) | MCQScreen (Resume tab), QuizScreen (restore) |
| `quizBookmarks` | QuizScreen (bookmark toggle) | MCQScreen (Saved tab), QuizScreen (icon state) |
| `streakDays` | streak.js `markStreakDay` | HomeScreen, ProfileScreen |
| `qotdState` | HomeScreen (after answer) | HomeScreen (same-day restore) |
| `xambuddyProfile` | App.js `handleSignIn` | App.js session restore |

## Supabase tables in use

| Table | Used by |
|-------|--------|
| `questions` | QOTD (HomeScreen), MCQScreen chapter/subject fetch, QuizScreen question fetch |
| `papers` | QBankScreen |
| `suggestions` | SuggestionsScreen |
| `auth` | Sign in / sign up / session |

## Dependencies (key)
- React Native `0.84.1`, React `19.2.3`
- Navigation: `@react-navigation/native ^7`, `@react-navigation/bottom-tabs ^7`, `@react-navigation/native-stack ^7`
- `@supabase/supabase-js ^2.103.0`
- `@react-native-async-storage/async-storage ^1.24.0`
- `react-native-vector-icons ^10.3.0`
- `react-native-linear-gradient`
- `react-native-safe-area-context`
