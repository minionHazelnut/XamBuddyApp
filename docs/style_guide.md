# XamBuddyRN Style Guide

Last updated: April 2026

---

## Color palette

### Global
- Primary light background: `#EBF4FF`
- Card surface: `#ffffff`
- Text primary: `#000000`
- Text secondary / subtitle: `rgba(0,0,0,0.6)` or `#64748b`
- Dark accent / primary button: `#1e4080`
- Dark accent text: `#2d3748`
- Muted text / icons: `#8a9a9a`
- Option badge background: `#dde8ff`

### HomeScreen
- Container background: `#EBF4FF`
- Top section background: `#1e4080` (solid dark navy)
- QOTD card background: `#EBF4FF`
- Bottom section gradient: `['#ffffff', '#EBF4FF']`
- QOTD overlay inner gradient: `['#ffffff', '#ebf4ff']`
- Back to home / action button: `#1e4080`

### Bottom Tab Bar (`App.js`)
- Tab bar background: `#ffffff`
- Active tab sliding circle: `#1e4080`
- Active icon: `#ffffff`
- Inactive icon / label: `#8a9a9a`
- Focused label: `#2d3748`
- Tab icons: `home`, `book`, `assignment`, `psychology` (Rio), `person`

### Auth Screen
- Background: `#1e4080`
- Card surface: `#ffffff`
- Primary button: `#1e4080`

### MCQScreen / QuizScreen / ChapterDetailScreen
- Background: `#f5f5f5`
- Cards: `#ffffff` with `elevation: 2`
- Primary button (Start Quiz, Resume): `#1e4080`
- Correct answer: border + label `#4CAF50`, bg `#e8f5e9`
- Wrong answer: border + label `#ef5350`, bg `#ffebee`
- Bookmark icon (saved): `#1e4080` / (unsaved): `#8a9a9a`

### ProgressScreen
- Screen background: `#f7fcff`
- Header background: `#ffffff`
- Bar colors: green `#22c55e` (≥80%), amber `#f59e0b` (50–79%), red `#ef4444` (<50%)
- Week dot filled: `#22c55e`
- Week dot today (unfilled): border `#4c8cff`
- CTA button: `#1e4080`

### ProfileScreen
- Background: `#EBF4FF`
- Cards: `#ffffff`

### Loading indicators (all screens)
- `ActivityIndicator` color: `#1e4080` (dark blue — NOT green/teal)

---

## Typography

From `lib/fonts.js`:
- `FONTS.heading` → `IstokWeb-Regular`
- `FONTS.headingBold` → `IstokWeb-Bold`
- `FONTS.body` → `IowanOldStyle-Roman`
- `FONTS.bodyBold` → `IowanOldStyle-Bold`
- `TEXT_COLORS.title`, `TEXT_COLORS.subtitle`

**Rule:** Never hardcode font family strings — always use `FONTS.*` constants.

---

## UI patterns

- **Background:** `#EBF4FF` for all new screens.
- **Primary action buttons:** `#1e4080`, `borderRadius: 12–16`, white text.
- **Cards:** white `#ffffff`, `borderRadius: 14–16`, `shadowOpacity: 0.08`, `shadowRadius: 4`, `elevation: 2–4`.
- **Section dividers:** horizontal line `#ccc` with centred label text.
- **Horizontal padding:** `20–24px` throughout.
- **Empty states:** centred icon (muted `#c0caca`) + text + subtext.
- **Semantic colours** (keep green/red): correct answer `#4CAF50`, wrong answer `#ef5350`, accuracy badges (green / amber / red).
- **Everything else that was teal `#4a6a6a`:** replace with `#1e4080`.
