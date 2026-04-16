# XamBuddyRN — Feature Status & Remaining Work

Last updated: April 2026

---

## Free Version Feature Checklist

| Feature | Status |
|---------|--------|
| Board / Class / Subject selection on signup | ✅ Done — grades 6th–12th + Other; boards CBSE / Karnataka PU / Other |
| Session persistence (stay logged in) | ✅ Done — Supabase AsyncStorage adapter + AppState token refresh |
| Sample Papers / Past Year Papers | ✅ Done — QBankScreen fetches from Supabase `papers` table |
| MCQ Answers + Explanations | ✅ Done — QuizScreen shows correct/wrong highlight + explanation toggle |
| 7-day Streak Tracker | ✅ Done — `lib/streak.js`; triggers on QOTD answer, quiz finish; shown on HomeScreen + ProfileScreen with week dots |
| Past 3 days performance analytics | ✅ Done — ProgressScreen with bar chart, accuracy, avg time |
| Long Answer — content screens | 🔶 Partial — PracticeScreen has 3 hardcoded example Biology Qs; not fetched from Supabase |
| Long Answer — self-assessment | ❌ Not done — no self-rating / mastery workflow |
| Short Answer — content screens | 🔶 Partial — PracticeScreen has 4 hardcoded example Qs across Biology + Chemistry; not from Supabase |
| MCQ in-progress resume | ✅ Done — back-navigate saves state; Resume tab on MCQScreen restores session |
| MCQ bookmarks / saved questions | ✅ Done — per-question bookmark persisted; Saved tab on MCQScreen |
| MCQ session history | ✅ Done — Finished tab on MCQScreen shows past results with accuracy badges |
| ProfileScreen — real stats | ✅ Done — avg accuracy, total Qs, tests taken from AsyncStorage |
| ProfileScreen — weak areas | ✅ Done — computed from chapters with accuracy < 60% |
| ProfileScreen — subject coverage | ✅ Done — computed from `quizProgressHistory` grouped by subject; bar colour by accuracy; empty state for new users |
| Rio AI chat | 🔶 UI done — chat bubbles, send button; responses are placeholder ("I'm still learning!") |
| Premium Plans screen | ✅ Done — PlansScreen with Free + Premium feature comparison cards |
| Suggestions / feedback | ✅ Done — SuggestionsScreen saves to Supabase `suggestions` table |
| Referral card on HomeScreen | ✅ Done — shows unique user code + Share button; live "X friends joined" count |
| Referral backend | 🔶 Partial — code generation + signup event tracking done; subscribe event and premium-day credit pending paywall |
| Sidebar menu (all tab screens) | ✅ Done — shared SidebarMenu component on Home, QBank, Practice, Rio, Profile |
| Premium gating / paywall | ❌ Not done — all features accessible regardless of plan; Plans screen is display-only |
| Quiz results to Supabase | ❌ Not done — results stored in AsyncStorage only; no cross-device history |
| User board/class in child screens | ❌ Not done — board/class in App.js state; HomeScreen + ProfileScreen receive `user`; MCQScreen/QuizScreen/QBankScreen do not filter by board/class |

---

## Remaining work — prioritised

### High priority (core free-tier gaps)

1. **Long answer content from Supabase**
   - Add `long_answers` table (or reuse `questions` with `question_type = 'long'`).
   - Replace hardcoded `LONG_ANSWER_DATA` in PracticeScreen with Supabase fetch.
   - Filter by subject + chapter + difficulty.

2. **Short answer content from Supabase**
   - Same as above for `SHORT_ANSWER_DATA`.
   - Add `short_answers` table or extend `questions`.

3. **Long/Short answer self-assessment**
   - After reading the answer, user rates themselves: "Got it" / "Needs review" / "Didn't know".
   - Save self-assessment per question to AsyncStorage; show mastery % per chapter.

4. ~~**Subject coverage — real data**~~ ✅ Done

5. **Rio AI integration**
   - Wire RioScreen's `handleSend` to the Claude API (or Supabase Edge Function proxy).
   - Stream or show typing indicator while waiting for response.
   - Context: include subject/chapter/board from user profile in system prompt.

### Medium priority (polish and growth)

6. ~~**Referral system backend**~~ 🔶 Partial — code + signup tracking done; subscribe event + credit pending paywall

7. **Premium gating**
   - Define which features are premium-only (e.g., unlimited MCQs, AI Rio, all long answers).
   - Show upgrade prompt when a free user hits a limit.
   - Connect to payment provider (RevenueCat / Razorpay / in-app purchase).

8. **Quiz results to Supabase**
   - On quiz finish, write result to a `quiz_results` table keyed to `user.id`.
   - Enables cross-device history and server-side analytics.

9. **User board/class context**
   - Pass `user` (or just `board` + `studentClass`) to MCQScreen, QuizScreen, QBankScreen via React Context or navigator params.
   - Use board/class to pre-filter Supabase queries (e.g., show only CBSE papers).

### Lower priority / future

10. **Notifications / reminders** — daily study nudge if streak is at risk.
11. **Leaderboard / social** — compare streaks with friends.
12. **More board/class content** — Karnataka PU, Class 9, Class 11 question banks.
13. **Offline mode** — cache questions locally for no-internet use.
14. **Profile avatar / photo** — current UI shows initials only.
