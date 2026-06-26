# Design System: كَنْه — "IVORY MANUSCRIPT"

> Source of truth, imported from the designer's Claude Design project ("كَنْه — Designer Prompt Brief", file `كَنْه - Design System.dc.html`). Every screen/component/token below follows it.
> Stack: Next.js 16 · React 19 · **Tailwind v4** (`@theme inline` + `--kanah-*` runtime vars) · Framer Motion · Arabic **RTL**.

---

## 0. Atmosphere
"قَبْلَ النَّوْم · رِفْقَةٌ هادئة" — a quiet before-sleep companion. Paper, pearl and sand by day; a warm night in the dark. **Antique, rare gold** and a **faint emerald** — accents that never shout. One meaning a night: read a story, keep a sentence that stayed with you, take a small pledge. No points, no streaks, no noise.

**Default theme is LIGHT (IVORY).** Dark (MIDNIGHT) is the alternate.

---

## 1. Color

### Light — IVORY (default)
- **bg** `#F1EADB` · **bg2** `#E9E0CD` — page surfaces (warm ivory paper)
- **card** `#FCFAF3` · **card2** `#F6EFE1` — raised / pressable surfaces
- **ink** `#2B2720` — primary text (warm near-black) · **ink2** `#6E6657` — secondary · **ink3** `#A89E88` — tertiary/locked
- **line** `#E2D8C3` — 1px borders/dividers
- **gold** `#9C7C38` — THE accent (antique). kickers, numbers, dots, thin rules, progress fill · **gold2** `#EFE6CF` — gold-subtle fills (reflection card)
- **emerald** `#4B7A61` — "completed / lived" state · **emerald2** `#E3ECE4` — emerald-subtle (completed badge bg)
- **midnight** `#26334C` — the deep slate "عمل اليوم" card and the "حُفظت" saved screen
- **shadow** `rgba(70,58,32,.10)` / **shadow2** `rgba(70,58,32,.06)` — one soft warm shadow only

### Dark — MIDNIGHT
- **bg** `#13151C` · **bg2/card** `#1B1E28` · **card2** `#232734`
- **line** `#2B3040`
- **ink/text** `#ECE5D4` · **ink2** `#B4AC97` · **ink3** `#7C7561`
- **gold** `#C8A961` · **gold2** `#2C2A20`
- **emerald** `#74A286` · **emerald2** `#1E2A23`
- **midnight** `#2E3B52` (lifts slightly in dark)

**Rules:** one accent (gold). Emerald only for "completed/lived". Midnight is reserved for the action card + saved screen. No neon, no glow, no gradient text. Never pure black/white.

---

## 2. Typography
**One family everywhere: `Greta Text Arabic`, fallback `Markazi Text`** (a modern, comfortable Arabic newspaper serif). It grows for headings and quiets for reading. *(Greta is commercial; we ship **Markazi Text** from Google Fonts, which is the design's specified fallback and what the artboards render with.)*

- **Headings / words:** 40–64px, line-height ~1.15.
- **Titles:** 24–27px.
- **Reading body:** 17–20px, line-height **2.05–2.2**.
- **Section labels:** 18–22px, weight 700.
- **Kickers:** 10–11px, letter-spacing 2–3px, **gold**, weight 600.
- **Numbers:** Arabic numerals ٠١٢٣ everywhere (story numbers, stats, name numbers), often in gold.

---

## 3. Components

- **Primary button** — **ink-filled pill** (`background: ink`, `color: card`) with a small **gold dot** before the label. Inverts in dark mode (cream pill / dark text). `active:scale-[.98]`, hover slight opacity. **Not** a gold button.
- **Secondary / skip** — transparent, `ink3` text, no border.
- **Cards** — `card` fill, 1px `line` border, radius **18–24px**, single soft warm shadow. Used for one idea each.
- **Reflection question card** — `gold2` background, gold-tinted border, gold kicker «سؤال محاسبة», large serif question.
- **Action card («عمل اليوم»)** — **midnight** background, cream text, gold kicker. The one dark element on a reading page.
- **Section label** — a short **gold 1px dash** + the bold serif word («القصة» / «المعنى الخفي» …).
- **Saved sentence quote** — serif, with a **2px gold right-border** (`border-right`) + right padding; secondary kept sentences use a `line` border instead.
- **Top bar** — back affordance (rounded-square, `card2`), gold kicker (track · story n), serif title, reading time; under it a 3px **gold progress bar** on a `line` track.
- **Bottom nav** — floating pill (`card`, `line` border, soft shadow); **active tab = ink pill + cream text + gold dot**; inactive = `ink2` text.
- **Completed badge** — `emerald2` bg, `emerald` text + dot, pill.
- **Stats** — big gold/emerald serif numbers + tiny `ink2` labels, separated by a 1px `line` divider.
- **Empty / locked / rest** states — quiet `card`/`card2` panels (locked dimmed ~0.78), serif line + a tiny glyph.

---

## 4. Geometry & motion
- **8pt grid:** 8 · 16 · 24 · 40 · 64 for spacing and radii.
- **Soft corners** (cards 18–24px, pills 99px). **One** soft warm shadow only.
- A **faint 8-point star** geometry as a *rare* background accent (e.g. featured names card, cover) — `repeating-conic-gradient` of gold at low opacity; never busy.
- **Motion:** gentle. `kmFade` = rise+fade `opacity 0→1, translateY 14→0`, `cubic-bezier(.22,.7,.2,1)`, ~`.9s`, staggered. Theme switch transitions colors over `.55s`. No bounce, no perpetual loops.

---

## 5. Screens (assembled)
- **اليوم (Today):** centered kicker «مسارك الآن» → big word → "القصة n من m" card with ink CTA «اقرأ قصة اليوم»; below, a «مكتبة الكلمات» row + the two stats. Done-state: emerald «قصة اليوم اكتملت» badge, the kept sentence (gold-bordered), and the pledge follow-up «هل اختبرت تعهدك اليوم؟».
- **القراءة (Reading):** sticky top bar + gold progress; section labels; serif body (lh 2.2); gold2 reflection card; **midnight** action card; sticky bottom button **locked until «عمل اليوم»** is reached.
- **أثري (Trace):** kicker «مرآتك الداخلية» → title «أثري» → 2×2 stats (gold/emerald/ink) → «الجمل التي بقيت فيك» with gold right-borders. *"مرآة لا لوحة إنجازات."*
- **المكتبة (Library):** track cards (status badge, big word, subtitle, description, gold progress bar); the names track is **featured** with the faint star geometry.
- **الإتمام (Completion):** sentence selector → pledge (gold2 box, ink CTA «آخذ هذا التعهّد») → **midnight** «حُفِظت» screen with the kept sentence + pledge.

---

## 6. Anti-patterns (banned)
- No gold-filled primary buttons (primary is ink). No neon/glow, no gradient text, no pure black/white.
- No gamification: no streaks, points, badges, flames, confetti, percentages-as-trophies.
- No second accent beyond gold (+ emerald only for "lived", midnight only for action/saved).
- No busy textures — the star geometry is rare and faint. One soft shadow only.
- No font other than Greta/Markazi. Arabic numerals only.
