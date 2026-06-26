# كَنْه (Kanah) — App Specification (for design)

> A complete, designer-ready map of every screen: purpose, content, states, and the **exact data field** behind each element. Hand this to a designer to redesign accurately.
> App is **Arabic, RTL, mobile-first** (single column, phone). Themes: **dark + light** (user-toggleable).

---

## 0. Concept & model

**Concept:** A calm, before-sleep Islamic reflection app. *You live ONE meaning a day.* Each "word"/value is a **track** = a set of independent daily stories. You read **one story per day per track** — a deliberate limit, never gamified. The soul: stillness, depth, sincerity.

**Storage:** Everything is local (`localStorage`) — no account, no server, no notifications. Progress, saved sentences, and pledges live on the device.

**The core loop (this is the product, not the content volume):**
`read a story → choose a sentence that stayed with you → take a behavioral pledge → (next day) review whether you lived it`

### Data model (field reference)

```ts
// A single daily story
StoryContent {
  id, storyNumber, title, readingTime,   // e.g. "٤ دقائق"
  story,             // the narrative
  hiddenMeaning,     // المعنى الخفي
  lifeImpact,        // الأثر في حياتك
  reflectionQuestion,// سؤال محاسبة
  dailyAction,       // عمل اليوم
  selectedLines[],   // candidate sentences to "keep"
  pledgeText,        // suggested pledge
  contentReady       // is this story's content written?
}

WordTrack  { id, word, subtitle, description, totalStories, stories[] }
NameItem   { id, number, name, title, readingTime, story, hiddenMeaning,
             lifeImpact, reflectionQuestion, dailyAction, selectedLines[],
             pledgeText, contentReady, stories?[] }   // some names span multiple days
NamesTrack { id, word, subtitle, description, totalNames, names[] }

// User state
Reflection { trackId, storyId, selectedLine, createdAt, dayKey }
Pledge     { trackId, storyId, pledgeText, status, createdAt, dayKey,
             dueDate, review?{dayKey,answer}, lastDeferredDayKey }
UserData   { completedStoriesByTrack, completedNamesByTrack,
             completedNameStoriesByTrack, reflections[], pledges[],
             activeTrackId, firstOpenedAt, dailyReads }
```

### Current content (tracks)
| Track | word | items | type |
|---|---|---|---|
| `kazm-al-ghayz` | كظم الغيظ | 10 stories | word track |
| `sadaqah` | الصدقة | 10 stories | word track |
| `al-ightirar-bil-ibadah` | الاغترار بالعبادة | 10 stories | word track |
| `asma-allah-al-husna` | أسماء الله الحسنى | 99 names | names track |

---

## Global / shared elements

| Element | Where | Content → data |
|---|---|---|
| **Splash** | on open | wordmark «كَنْه» · thin divider · tagline «الكلمة أعمق مما تظن». Fades into app. |
| **Page header** | top of tabs | small «كَنْه» wordmark · large page **title** (اليوم/المكتبة/أثري) · one-line **tagline** · **theme toggle** (dark⇄light) |
| **Bottom nav** | all tabs | floating pill, 3 items: **اليوم** `/` · **المكتبة** `/library` · **أثري** `/trace`; active item highlighted |
| **Top bar** | reading/sub screens | back affordance · kicker (`track.word · القصة {storyNumber}`) · story `title` · `readingTime` |
| **Numbers** | everywhere | Arabic numerals ٠١٢٣ |

---

## 1. اليوم — Home  `/`

**Purpose:** Daily entry — surface today's one meaning, or confirm today is done.

### State A — today NOT done (Today's Story card)
| Element | Data |
|---|---|
| Kicker «مسارك الآن» | static (or «ابدأ رحلتك» if no active track) |
| Focal **word** | `activeTrack.word` |
| Line «كل مسار يفتح لك قصة واحدة يومياً» | static |
| Story meta «القصة {n} من {total}» | `nextStory.storyNumber`, `activeTrack.totalStories` |
| Story **title** | `nextStory.title` |
| Subtitle | `activeTrack.subtitle` |
| Primary CTA «اقرأ قصة اليوم» | → `/tracks/{trackId}/stories/{nextStory.id}` |
| *(fallback)* list of available tracks | each: `track.word`, `track.subtitle`, progress `completed/total` |

### State B — today DONE (Done Today card)
| Element | Data |
|---|---|
| Badge «قصة اليوم اكتملت» | static |
| Focal **word** + «أتممت قصة اليوم» + story title | `activeTrack.word`, `todayStory.title` |
| Saved sentence «الجملة التي بقيت فيك» | `reflection.selectedLine` |
| Pledge follow-up «هل اختبرت تعهدك اليوم؟» | `pledge.pledgeText`; options → نعم طبّقته / حاولت / لم أنتبه / لم أواجه موقفاً |
| Note about one story/day | static |

### Below (both states)
- **Library link card** «مكتبة الكلمات — كل كلمة مسار قصصي كامل» → `/library`.
- **Two stats**: «قصص أتممتها» (= total completed stories), «أيام عشت فيها معنى» (= number of distinct active days).

---

## 2. المكتبة — Library  `/library`

**Purpose:** Browse all tracks.

**Track card** (one per track):
| Element | Data |
|---|---|
| Status badge | one of: آخر مسار قرأته / بدأت هذا المسار / متاح الآن / قيد الإعداد / قريباً (locked) — derived from progress + `contentReady` + `activeTrackId` |
| Focal **word** | `track.word` |
| Subtitle | `track.subtitle` |
| Description | `track.description` |
| Progress «{done} من {total}» + bar | computed vs `totalStories`/`totalNames` |
| Tap | available → `/tracks/{id}` (or `/tracks/{id}/names` for names track) |

The names track is shown **featured**.

---

## 3. أثري — My Trace  `/trace`

**Purpose:** A personal mirror of inner progress — *not* an achievements dashboard.

| Block | Content → data |
|---|---|
| Today's meaning (if done) | «✓ معنى اليوم» · `todayTrack.word` · `todayStory.title` |
| **Four stats** (with captions) | قصص أتممتها · أيام عشت فيه معنى · تعهدات أخذتها · مرات طبّقته (counts from `reflections`/`pledges`/`dailyReads`) |
| **Progress per track** | list of all tracks: `track.word`, `track.subtitle`, `progress/total` + bar |
| **«الجمل التي بقيت فيك»** | archive of `reflections[]`: each = `selectedLine` (quote) + `track.word` + `story.title` + date (`dayKey`). Empty state invites first save. |
| **«آخر تعهد»** | latest `pledge`: `track.word` + `story.title` + `pledgeText` + status label |
| *(dev only)* reset button | clears local data |

---

## 4. Track overview  `/tracks/[trackId]`

**Purpose:** Overview of a word-track + its stories.

| Element | Data |
|---|---|
| Focal **word** | `track.word` |
| Subtitle + description | `track.subtitle`, `track.description` |
| **Story list** | each `story`: `storyNumber`, `title`, **status** = available / completed / locked (one opens per day) |
| Tap | available/completed → reading screen; locked → not yet |

---

## 5. Story reading  `/tracks/[trackId]/stories/[storyId]`

**Purpose:** The core experience — read & live one story. Scrolls top→bottom.

| Section | Data |
|---|---|
| Top bar | `track.word · القصة {storyNumber}`, `story.title`, `story.readingTime` |
| Reading progress bar (pinned) | scroll-driven |
| Hero: kicker + **word** + **title** + subtitle | `track.word`, `story.title`, `track.subtitle` |
| **القصة** | `story.story` |
| **المعنى الخفي** | `story.hiddenMeaning` |
| **أثرها في حياتك** | `story.lifeImpact` |
| **سؤال محاسبة** (card) | `story.reflectionQuestion` |
| **عمل اليوم** (card) | `story.dailyAction` |
| Bottom CTA «أتممت عمل اليوم» | **disabled until reader scrolls to «عمل اليوم»** (anti-skip). If already done: «أتممت هذه القصة بالفعل» |

**Daily-rest state** (already read today): calm notice «خذ وقتك مع معنى اليوم… القصة التالية تُفتح غداً.» instead of the story.

---

## 6. Completion flow  `/tracks/[trackId]/stories/[storyId]/complete`

**Purpose:** Turn reading into a kept meaning. Two steps + confirm.

| Step | Content → data |
|---|---|
| 1 — «اختر الجملة التي بقيت فيك» | pick ONE from `story.selectedLines[]` (or skip) → saved as `reflection.selectedLine` |
| 2 — «تعهد اليوم» | commit to `story.pledgeText` (or postpone) → saved as a `pledge` |
| Saved | confirmation «حُفظت» — sentence + pledge now in أثري |

---

## 7. أسماء الله الحسنى (Names track)

99 names, each with its own reflection.

| Screen | Route | Content |
|---|---|---|
| Names list | `/tracks/[trackId]/names` | `track.word` + list of 99: each `number` + `name` + `title`; status available/in-preparation |
| Single name | `/tracks/[trackId]/names/[nameId]` | same reading structure as a story (hero `name` + `story`/`hiddenMeaning`/`lifeImpact`/`reflectionQuestion`/`dailyAction`); daily-rest notice when read today |
| Name's days | `/tracks/[trackId]/names/[nameId]/stories` (+ `…/stories/[storyId]`) | for names with multiple `stories[]`: list of the name's days, each opens like a reading screen |
| Name completion | `…/complete` | same 2-step completion (sentence → pledge) |

---

## 8. المساعد الإسلامي — Assistant  `/chat`

**Purpose:** AI chat to ask about أسماء الله الحسنى.
**Content:** top bar («كَنْه» · المساعد الإسلامي) · hint «اسألني عن أسماء الله الحسنى» · message list + composer.
*(Recommended future change: narrow its scope to "ask about the name only," not general fatwa.)*

---

## Cross-cutting constraints (for the designer)
- **RTL Arabic**, mobile-first, single column (`max-w-md`).
- **Dark + light themes**, user-toggleable.
- **One story / track / day** is central — after reading, the track "rests" until tomorrow.
- **No gamification** — no streaks, points, badges, leaderboards, confetti.
- **The daily loop** (read → keep a sentence → pledge → next-day review) is the heart; design should make that loop feel like a quiet ritual, not a content feed.
- Tone: calm, reflective, intimate — a before-sleep companion.
