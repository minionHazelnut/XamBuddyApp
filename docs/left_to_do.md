# XamBuddyRN — Left To Do

Last updated: April 2026

---

## High Priority

1. **Long + short answer content from Supabase**
   - Currently hardcoded dummy Biology/Chemistry data in PracticeScreen.
   - Need a Supabase table (`long_answers`, `short_answers`, or extend `questions` with `question_type`).
   - Fetch by subject + chapter + difficulty; replace static arrays.

2. **Self-assessment for long/short answers**
   - After reading the answer, user rates: "Got it" / "Needs review" / "Didn't know".
   - Save per-question mastery rating to AsyncStorage.
   - Show mastery % per chapter on the chapter card.

3. ~~**Subject coverage — real data in ProfileScreen**~~ ✅ Done
   - Computed from `quizProgressHistory` grouped by `subject`; bar colour by accuracy (green/amber/red); sorted by accuracy descending; empty state for new users.

4. **Rio AI integration**
   - Chat UI is complete; responses currently return `"I'm still learning!"`.
   - Wire `handleSend` to Claude API via a Supabase Edge Function proxy.
   - Include user's board / subject context in the system prompt.
   - Add typing indicator while waiting for response.

---

## Medium Priority

5. ~~**Referral system backend**~~ ✅ Done
   - Unique referral code auto-generated per user and stored in Supabase `referral_codes` table.
   - HomeScreen referral card shows the code with a native Share button.
   - Signup flow records a `signup` event in `referral_events` when a new user enters a referral code.
   - Referral count ("X friends joined") shown live on HomeScreen.
   - Remaining: subscribe event (wire when paywall is built), premium-day credit logic.

6. **Premium gating / paywall**
   - PlansScreen exists but all features are freely accessible regardless of plan.
   - Define which features are premium-only (e.g. unlimited MCQs, Rio AI, all long answers).
   - Show upgrade prompt when free user hits a limit.
   - Connect to payment provider (RevenueCat / Razorpay / in-app purchase).

7. **Quiz results → Supabase**
   - Results currently saved to AsyncStorage only; lost if app is reinstalled.
   - Write to a `quiz_results` table keyed to `user.id` on quiz finish.
   - Enables cross-device history and server-side analytics.

8. **Board/class context in child screens**
   - Board and class live in `App.js` state; HomeScreen and ProfileScreen receive `user` prop.
   - Pass via React Context so MCQScreen, QuizScreen, QBankScreen can filter Supabase queries by board/class.

---

## Lower Priority / Future

9. **Push notifications**
   - Daily study nudge if streak is at risk (hasn't practiced today).
   - Exam countdown reminders.

10. **More board/class content**
    - Karnataka PU, Class 9, Class 11 question banks.
    - Currently only CBSE 10th questions are populated in Supabase.

11. **Leaderboard / social**
    - Compare streaks or scores with friends.

12. **Offline mode**
    - Cache questions locally for no-internet study sessions.

13. **Profile avatar / photo**
    - Current UI shows initials only; allow photo upload.
