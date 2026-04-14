# XamBuddyRN Free Version Requirements

## Free Version Features

1. Board / Class / Subject selection on signup
   - Instant personalization — they feel the app is built for them in 60 seconds.

2. Sample Papers (Latest 1)
   - High search intent before exams. Students actively look for this.

3. MCQ Answers + Explanations
   - Makes them feel they're actually learning, not just guessing. Keeps session quality high.

4. Long Answer - 3 per chapterasy mediums andith self assessment
   - Shows the quality of your content. Plants the upgrade desire without forcing it.

5. 7-day Streak Tracker
   - The single most powerful retention mechanic. Duolingo proved this. Build it in V1.

6. Past 3 days’ performance analytics
   - Gives them a reason to return and beat their own score.

---

## Current Implementation Status

### Implemented / fully done

#### Auth + Onboarding (`App.js`)
- Sign in / sign up with email/password via Supabase (local auth fallback included).
- Post-signup multi-stage flow: board selection (CBSE, Karnataka PU, Other) → grade selection (10th, 12th, Other).

#### Question Of The Day — QOTD (`HomeScreen.js`) ✅
- **Card:** Teal gradient featured card on HomeScreen. Tap triggers animated expand.
- **Overlay (inline, not a separate screen):** Card animates from its measured position to fill the full screen (position, size, borderRadius all animated via `Animated.parallel`).
- **Question fetch:** Pulls a random easy MCQ from Supabase `questions` table (filters `question_type = mcq`, `difficulty = easy`, picks random from top 20).
- **Persistence:** Today's question + chosen answer + feedback saved to AsyncStorage (`qotdState` key) with a date key. Re-opening the same day restores the saved state — same question shown all day.
- **Answer flow:** A/B/C/D options shown with letter badges. After tap, correct option turns green; wrong selection turns red. Options disabled after answering.
- **Post-answer:** "Back to home" button appears. Overlay closes with reverse animation back to card position.
- **Error/loading states:** Activity indicator while loading; error message if Supabase fetch fails.

#### QBank (`QBankScreen.js`) ✅
- Past Year Papers + Sample Papers tabs.
- Fetches from Supabase `papers` table (by category + year descending). Falls back to placeholder years when table is empty.
- Opens paper URL via `Linking`. Alert if no URL attached.

#### Practice (`PracticeScreen.js`, `MCQScreen.js`, `QuizScreen.js`) ✅
- Nested stack: Practice home → ChapterDetail → MCQ/Quiz.
- Questions fetched from Supabase `questions` table.
- QuizScreen: answer selection, explanation toggle, score summary. Writes completed quiz result to AsyncStorage (`quizProgressHistory`).

#### Past 3 Days Performance Analytics (`ProgressScreen.js`) ✅
- Accessible from HomeScreen "Track your progress" card (via HomeStack navigator).
- Reads `quizProgressHistory` from AsyncStorage; aggregates per-day stats (correct, wrong, attempted, accuracy, timeMins, topics).
- Shows 3-bar chart for last 3 active days (with placeholder bars for missing days).
- Summary card: 3-day average score, accuracy, time, strongest/weak topic.
- CTA button navigates to Practice tab.

### Not implemented / gaps
- **7-day Streak Tracker** — HomeScreen still shows static `12`. No date tracking, persistence, or daily completion logic.
- **Long answer content and self-assessment** — no screens or data model.
- **ProfileScreen** — placeholder only.
- **RioScreen** — placeholder only.
- **Shared user context** — board/class from login lives only in App.js state; not passed to child screens.
- **Supabase quiz persistence** — quiz results stored in AsyncStorage only; not written to Supabase.

### Backend / Supabase status
- Supabase configured in `lib/supabase.js`.
- Active usage: auth (sign in/sign up), `questions` table (QOTD, MCQ, Quiz), `papers` table (QBank).
- Quiz results and QOTD state stored in AsyncStorage only — not persisted to Supabase.

### Recommended next steps
1. Build real 7-day streak tracker with AsyncStorage date tracking and daily completion logic.
2. Build Long Answer content screens and self-assessment workflow.
3. Implement ProfileScreen.
4. Implement RioScreen.
5. Add board/class context (React Context or similar) so child screens can read the user’s board/class.
6. Persist quiz results to Supabase for cross-device history.
