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

### Implemented / partially implemented
- `HomeScreen.js` contains UI placeholders for:
  - "Question Of The Day" card
  - "Track your progress" card
  - "Streak" card showing a static value (`12`)
  - "Before Exam Formulas, Theorems & Diagrams" card
- `App.js` defines the main bottom-tab navigation structure with tabs for Home, QBank, Practice, Rio, and Profile.
- `PracticeScreen.js` contains a practice home flow and a nested stack with `MCQ`, `ChapterDetail`, and `Quiz` screens.
- `MCQScreen.js` uses Supabase and fetches `subject`/`chapter` for MCQ questions from the `questions` table.
- `QuizScreen.js` fetches MCQ questions from Supabase and supports answer selection, explanation toggle, quiz navigation, and score summary.

### Not implemented / gaps
- Board / Class / Subject signup personalization flow
  - No signup or onboarding screen exists in the current source.
  - No subject or board selection data model is present.

- Sample Papers (Latest 1)
  - No dedicated screen or content for sample papers is implemented.
  - `QBankScreen.js` remains a placeholder.

- MCQ Answers + Explanations
  - Partial implementation exists in `QuizScreen.js`, but there is no complete question engine or user progress tracking.
  - No persistence of answers, explanation history, or feedback state across sessions.

- Long Answer content and self-assessment
  - No long-answer chapter content screens or assessment workflows are implemented.

- 7-day Streak Tracker
  - Only a static streak card exists on `HomeScreen.js`.
  - No actual streak persistence, date tracking, or daily completion logic.

- Past 3 days’ performance analytics
  - No analytics dashboard or performance summary UI exists.
  - No scoring history, streak analytics, or charting implementation.

### Backend / Supabase status
- Supabase is configured in `lib/supabase.js` with a public anon key and project URL.
- Active Supabase usage is limited to MCQ question fetching in `MCQScreen.js` and `QuizScreen.js`.
- There is no Supabase auth, user profile data, or persistent progress storage in the current code.

### Structural gaps
- `QBankScreen.js`, `RioScreen.js`, and `ProfileScreen.js` are placeholders.
- `PracticeScreen.js` is partially implemented but lacks end-to-end free-version workflows for sample papers and analytics.
- No shared user state management or backend persistence beyond question loading.

### Recommended next steps
1. Implement onboarding/signup flow with board/class/subject selection.
2. Add data models for questions, sample papers, long answer content, and user performance.
3. Build `QBank`, `Practice`, `Profile`, and `Rio` screens around the free-version feature set.
4. Replace static `Streak` content with real date tracking, completion logic, and daily streak persistence.
5. Add a performance analytics view for the last 3 days and persist quiz results to Supabase.
