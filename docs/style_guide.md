# XamBuddyRN Style Guide

## Color palette

### Global
- Primary light background: `#EBF4FF`
- Card surface: `#ffffff`
- Text primary: `#000000`
- Text secondary / subtitle: `rgba(0,0,0,0.6)` or `#64748b`
- Dark accent text: `#2d3748`
- Muted text / icons: `#8a9a9a`

### HomeScreen
- Container background: `#EBF4FF`
- Top section background: `#1e4080` (dark navy, matches tab circle)
- Top section previous gradient (saved): `['#3b82f6', '#6366f1', '#818cf8']` (left→right diagonal)
- QOTD card background: `#EBF4FF`
- QOTD card text: `#000000` (title), `rgba(0,0,0,0.6)` (subtitle)
- White curved panel: `#ffffff`
- Bottom section gradient: `['#ffffff', '#EBF4FF']` (top→bottom)
- QOTD overlay inner gradient: `['#ffffff', '#ebf4ff']`
- Option badge background: `#dde8ff`
- Back to home / action button: `#1e4080`

### Bottom Tab Bar (App.js)
- Tab bar background: `#ffffff`
- Active tab sliding circle: `#1e4080`
- Active icon color: `#ffffff`
- Inactive icon / label color: `#8a9a9a`
- Focused label color: `#2d3748`

### QBankScreen
- Screen background: `#EBF4FF`
- Active pill button: `#1e4080`
- Inactive pill button: `#ffffff` with border `#cbd5e1`
- Paper cards: `#ffffff`

### ProgressScreen
- Screen background: `#f7fcff`
- Header background: `#ffffff`
- Bar: green `#22c55e` (≥80%), amber `#f59e0b` (50–79%), red `#ef4444` (<50%)
- Week dot filled: `#22c55e`
- Week dot today (unfilled): border `#4c8cff`
- CTA button: green `#16a34a` (practiced today), amber `#d97706` (streak alive), blue `#4c8cff` (no streak)

### Auth Screen
- Background: `#6b7c7c`
- Primary button: `#2d5a5a`

## Typography
- Headings: `IstokWeb-Regular`
- Bold headings: `IstokWeb-Bold`
- Body / paragraph: `IowanOldStyle-Roman`
- Bold body / emphasis: `IowanOldStyle-Bold`

## UI patterns
- Blue palette throughout — `#EBF4FF` as the base light tone, `#1e4080` as the dark accent.
- White rounded cards with subtle shadows (`shadowOpacity: 0.1`, `shadowRadius: 8`, `elevation: 4`).
- Generous section spacing and consistent padding (`20–24px` horizontal).
- Rounded corners on all cards and buttons (`borderRadius: 16–24`).
- Gradient backgrounds for large sections (HomeScreen top, bottom section).
- Icons minimal, color-contrasted using dark accents.

## Consistency rules for future screens
- Use `#EBF4FF` as the default screen background.
- Use `#1e4080` for primary action buttons and active state accents.
- Reuse font tokens from `lib/fonts.js` — never hardcode font names.
- Match card styling: white bg, `borderRadius: 16`, shadow from the pattern above.
- Follow ProgressScreen's bar color logic for any accuracy/score indicators.
