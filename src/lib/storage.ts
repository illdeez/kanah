import { getTrack, wordTracks } from "@/data/days";

export interface Reflection {
  trackId: string;
  storyId: number;
  selectedLine: string;
  /** Real time of the action (full ISO timestamp). */
  createdAt: string;
  /** [P0-02] The app-day the reflection belongs to (YYYY-MM-DD). */
  dayKey?: string;
}

// [P0-04] Unified pledge lifecycle: pending → reviewed, or pending → soft_closed
// (aged out without judgement). No permanent "debt".
export type PledgeStatus = "pending" | "reviewed" | "soft_closed";

// How the user answered the accountability review.
export type PledgeReviewAnswer =
  | "applied" // طبّقته
  | "tried" // حاولت
  | "missed" // لم أنتبه / فاتني الموقف
  | "no_situation" // لم أواجه موقفاً
  | "forgot"; // لا أذكر (late review)

// A tap on the review prompt: a real review answer, or deferring it.
// `not_now` is NOT a review — it doesn't move the pledge to "reviewed".
export type PledgePromptAction = PledgeReviewAnswer | "not_now";

export interface Pledge {
  trackId: string;
  storyId: number;
  pledgeText: string;
  status: PledgeStatus;
  /** Real time of the action (full ISO timestamp). */
  createdAt: string;
  /** [P0-02] The app-day the pledge belongs to (YYYY-MM-DD). */
  dayKey?: string;
  /** [P0-04] App-day the review becomes due (created day + 1). */
  dueDate?: string;
  /** [P0-04] Set when the user reviews the pledge. */
  review?: { dayKey: string; answer: PledgeReviewAnswer };
  /** [P1] Last app-day the user tapped "not now" on this pledge's gate. */
  lastDeferredDayKey?: string;
}

export interface DailyRead {
  trackId: string;
  itemType: "story" | "name" | "nameStory";
  storyId?: number;
  nameId?: string;
  completedAt: string;
  /** [P0-03] The app-day bucket this read belongs to. Self-describing so legacy
   *  UTC-bucketed reads can be reclassified by their real timestamp on lookup. */
  dayKey?: string;
}

export interface UserData {
  completedStoriesByTrack: Record<string, number[]>;
  completedNamesByTrack: Record<string, string[]>;
  completedNameStoriesByTrack: Record<string, Record<string, number[]>>;
  reflections: Reflection[];
  pledges: Pledge[];
  activeTrackId: string | null;
  firstOpenedAt: string | null;
  dailyReads: Record<string, Record<string, DailyRead>>;
}

const KEY = "kanah_data";
const LEGACY_PRIMARY_TRACK = "kazm-al-ghayz";

const defaults: UserData = {
  completedStoriesByTrack: {},
  completedNamesByTrack: {},
  completedNameStoriesByTrack: {},
  reflections: [],
  pledges: [],
  activeTrackId: LEGACY_PRIMARY_TRACK,
  firstOpenedAt: null,
  dailyReads: {},
};

function getDefaultActiveTrackId(): string | null {
  return wordTracks[0]?.id ?? null;
}

function getDailyReadKey(trackId: string, nameId?: string): string {
  return nameId ? `${trackId}:${nameId}` : trackId;
}

function uniqueSorted(values: number[]): number[] {
  return Array.from(new Set(values)).sort((a, b) => a - b);
}

function migrateLegacyData(raw: unknown): UserData {
  const source =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const completedStoriesByTrack: Record<string, number[]> = {
    ...(source.completedStoriesByTrack &&
    typeof source.completedStoriesByTrack === "object"
      ? (source.completedStoriesByTrack as Record<string, number[]>)
      : {}),
  };

  if (Array.isArray(source.completedDays) && source.completedDays.length > 0) {
    const legacyValues = source.completedDays.filter(
      (value): value is number => typeof value === "number"
    );
    completedStoriesByTrack[LEGACY_PRIMARY_TRACK] = uniqueSorted([
      ...(completedStoriesByTrack[LEGACY_PRIMARY_TRACK] ?? []),
      ...legacyValues,
    ]);
  }

  const completedNamesByTrack: Record<string, string[]> =
    source.completedNamesByTrack &&
    typeof source.completedNamesByTrack === "object"
      ? (source.completedNamesByTrack as Record<string, string[]>)
      : {};

  const completedNameStoriesByTrack: Record<string, Record<string, number[]>> =
    source.completedNameStoriesByTrack &&
    typeof source.completedNameStoriesByTrack === "object"
      ? (source.completedNameStoriesByTrack as Record<string, Record<string, number[]>>)
      : {};

  const reflections: Reflection[] = Array.isArray(source.reflections)
    ? source.reflections
        .map((entry): Reflection | null => {
          if (!entry || typeof entry !== "object") return null;
          const reflection = entry as Record<string, unknown>;
          const trackId =
            typeof reflection.trackId === "string"
              ? reflection.trackId
              : LEGACY_PRIMARY_TRACK;
          const storyId =
            typeof reflection.storyId === "number"
              ? reflection.storyId
              : typeof reflection.dayId === "number"
              ? reflection.dayId
              : null;
          const selectedLine =
            typeof reflection.selectedLine === "string"
              ? reflection.selectedLine
              : typeof reflection.answer === "string"
              ? reflection.answer
              : "";
          const createdAt =
            typeof reflection.createdAt === "string"
              ? reflection.createdAt
              : new Date().toISOString().split("T")[0];

          if (!storyId || !selectedLine.trim()) return null;

          // [P0-03] Don't slice the (UTC) createdAt — that would reintroduce the
          // UTC bug. Re-derive the app-day through the same local/4am transform.
          const dayKey =
            typeof reflection.dayKey === "string"
              ? reflection.dayKey
              : getAppDayKey(new Date(createdAt));

          return {
            trackId,
            storyId,
            selectedLine,
            createdAt,
            dayKey,
          };
        })
        .filter((entry): entry is Reflection => entry !== null)
    : [];

  const pledges: Pledge[] = Array.isArray(source.pledges)
    ? source.pledges
        .map((entry): Pledge | null => {
          if (!entry || typeof entry !== "object") return null;
          const pledge = entry as Record<string, unknown>;
          const trackId =
            typeof pledge.trackId === "string"
              ? pledge.trackId
              : LEGACY_PRIMARY_TRACK;
          const storyId =
            typeof pledge.storyId === "number" ? pledge.storyId : null;
          const pledgeText =
            typeof pledge.pledgeText === "string" ? pledge.pledgeText : "";
          const createdAt =
            typeof pledge.createdAt === "string"
              ? pledge.createdAt
              : new Date().toISOString().split("T")[0];

          if (!storyId || !pledgeText.trim()) return null;

          const dayKey =
            typeof pledge.dayKey === "string"
              ? pledge.dayKey
              : getAppDayKey(new Date(createdAt));

          // [P0-04] Map legacy statuses onto the new lifecycle. Old "active"
          // → pending; old terminal outcomes → reviewed + the matching answer.
          const legacyAnswerMap: Record<string, PledgeReviewAnswer> = {
            done: "applied",
            tried: "tried",
            forgot: "forgot", // memory lapse ≠ failure; keep distinct from "missed"
            no_situation: "no_situation",
          };
          let status: PledgeStatus;
          let review: Pledge["review"];
          if (
            pledge.status === "pending" ||
            pledge.status === "reviewed" ||
            pledge.status === "soft_closed"
          ) {
            status = pledge.status;
            const r = pledge.review as Record<string, unknown> | undefined;
            if (r && typeof r.answer === "string" && typeof r.dayKey === "string") {
              review = { dayKey: r.dayKey, answer: r.answer as PledgeReviewAnswer };
            }
          } else if (
            typeof pledge.status === "string" &&
            pledge.status in legacyAnswerMap
          ) {
            status = "reviewed";
            review = { dayKey, answer: legacyAnswerMap[pledge.status] };
          } else {
            status = "pending";
          }

          const dueDate =
            typeof pledge.dueDate === "string"
              ? pledge.dueDate
              : addAppDays(dayKey, 1);

          return {
            trackId,
            storyId,
            pledgeText,
            status,
            createdAt,
            dayKey,
            dueDate,
            ...(review ? { review } : {}),
          };
        })
        .filter((entry): entry is Pledge => entry !== null)
    : [];

  const activeTrackId =
    typeof source.activeTrackId === "string"
      ? source.activeTrackId
      : typeof source.lastOpenedDay === "number"
      ? LEGACY_PRIMARY_TRACK
      : getDefaultActiveTrackId();

  const dailyReads: Record<string, Record<string, DailyRead>> = {};
  if (source.dailyReads && typeof source.dailyReads === "object") {
    for (const [date, dateEntry] of Object.entries(
      source.dailyReads as Record<string, unknown>
    )) {
      if (!dateEntry || typeof dateEntry !== "object") continue;

      // Detect old format: value has trackId/completedAt directly (single read per day)
      // New format: value is an object keyed by trackId
      const e = dateEntry as Record<string, unknown>;
      if (typeof e.trackId === "string" && typeof e.completedAt === "string") {
        // Old format — migrate to new
        const itemType: "story" | "name" | "nameStory" =
          e.itemType === "name" ? "name" : e.itemType === "nameStory" ? "nameStory" : "story";
        const read: DailyRead =
          itemType === "name"
            ? { trackId: e.trackId, itemType: "name", nameId: typeof e.nameId === "string" ? e.nameId : undefined, completedAt: e.completedAt }
            : itemType === "nameStory"
            ? { trackId: e.trackId, itemType: "nameStory", nameId: typeof e.nameId === "string" ? e.nameId : undefined, storyId: typeof e.storyId === "number" ? e.storyId : undefined, completedAt: e.completedAt }
            : { trackId: e.trackId, itemType: "story", storyId: typeof e.storyId === "number" ? e.storyId : undefined, completedAt: e.completedAt };
        const key =
          itemType === "story"
            ? getDailyReadKey(e.trackId)
            : getDailyReadKey(
                e.trackId,
                typeof e.nameId === "string" ? e.nameId : undefined
              );
        dailyReads[date] = { [key]: read };
      } else {
        // New format — parse per-track entries
        const trackMap: Record<string, DailyRead> = {};
        for (const [readKey, trackEntry] of Object.entries(e)) {
          if (!trackEntry || typeof trackEntry !== "object") continue;
          const te = trackEntry as Record<string, unknown>;
          if (typeof te.completedAt !== "string") continue;
          const itemType: "story" | "name" | "nameStory" =
            te.itemType === "name" ? "name" : te.itemType === "nameStory" ? "nameStory" : "story";
          const storedTrackId =
            typeof te.trackId === "string"
              ? te.trackId
              : typeof te.nameId === "string" && readKey.includes(":")
              ? readKey.split(":")[0]
              : readKey;
          const storedNameId =
            typeof te.nameId === "string" ? te.nameId : undefined;
          const normalizedKey =
            itemType === "story"
              ? getDailyReadKey(storedTrackId)
              : getDailyReadKey(storedTrackId, storedNameId);
          trackMap[normalizedKey] =
            itemType === "name"
              ? { trackId: storedTrackId, itemType: "name", nameId: storedNameId, completedAt: te.completedAt }
              : itemType === "nameStory"
              ? { trackId: storedTrackId, itemType: "nameStory", nameId: storedNameId, storyId: typeof te.storyId === "number" ? te.storyId : undefined, completedAt: te.completedAt }
              : { trackId: storedTrackId, itemType: "story", storyId: typeof te.storyId === "number" ? te.storyId : undefined, completedAt: te.completedAt };
        }
        if (Object.keys(trackMap).length > 0) dailyReads[date] = trackMap;
      }
    }
  }

  return {
    completedStoriesByTrack: Object.fromEntries(
      Object.entries(completedStoriesByTrack).map(([trackId, stories]) => [
        trackId,
        uniqueSorted(
          Array.isArray(stories)
            ? stories.filter((value): value is number => typeof value === "number")
            : []
        ),
      ])
    ),
    completedNamesByTrack,
    completedNameStoriesByTrack,
    reflections,
    pledges,
    activeTrackId:
      activeTrackId && getTrack(activeTrackId)
        ? activeTrackId
        : getDefaultActiveTrackId(),
    firstOpenedAt:
      typeof source.firstOpenedAt === "string" ? source.firstOpenedAt : null,
    dailyReads,
  };
}

export function getUserData(): UserData {
  if (typeof window === "undefined") return { ...defaults };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    return { ...defaults, ...migrateLegacyData(JSON.parse(raw)) };
  } catch {
    return { ...defaults };
  }
}

export function saveUserData(data: UserData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function setActiveTrack(trackId: string): void {
  const data = getUserData();
  data.activeTrackId = trackId;
  saveUserData(data);
}

// [P0-01] A "kanah day" rolls over at 04:00 *local* time. Two reasons:
//   1. The real bug being fixed: the old code used UTC (`toISOString`), so an
//      evening reader in a negative-UTC timezone got bucketed into "tomorrow".
//   2. Night-owl grace: reading at 01:00 still counts toward the day just ended,
//      which suits a before-sleep app. Tune the boundary with one constant.
export const APP_DAY_BOUNDARY_HOUR = 4;

/**
 * The kanah day-bucket key (YYYY-MM-DD) for a given instant, in local time.
 * Uses a local-hour comparison (not ms subtraction) so it stays correct across
 * DST transitions: e.g. 03:30 on a fall-back day still resolves to the prior day.
 */
export function getAppDayKey(date: Date = new Date()): string {
  const d = new Date(date.getTime());
  if (d.getHours() < APP_DAY_BOUNDARY_HOUR) {
    d.setDate(d.getDate() - 1);
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Adds `n` whole app-days to a YYYY-MM-DD key (for pledge dueDate in P0-04). */
export function addAppDays(dayKey: string, n: number): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/** [P0-03] The legacy UTC key older builds wrote. Lookup-only, for migration. */
function getLegacyUtcDayKey(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

export function getTodayString(): string {
  return getAppDayKey();
}

/** The app-day a stored read actually belongs to: its own `dayKey` if present
 *  (new records), else reclassified from its `completedAt` timestamp (legacy). */
function readEffectiveDayKey(read: DailyRead): string {
  if (read.dayKey) return read.dayKey;
  return read.completedAt ? getAppDayKey(new Date(read.completedAt)) : "";
}

/**
 * [P0-03] Today's reads. Rather than trust the (possibly legacy-UTC) bucket key,
 * we gather entries from today's bucket plus the adjacent legacy UTC buckets and
 * keep only those whose *effective* app-day is today. This avoids the false
 * positives/negatives of a plain date-string merge on the upgrade day.
 * Entries already in today's correct bucket win on conflict.
 */
function getTodayReadMap(data: UserData): Record<string, DailyRead> {
  const reads = data.dailyReads ?? {};
  const todayKey = getAppDayKey();
  const now = new Date();
  const candidateBuckets = [
    getLegacyUtcDayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000)),
    getLegacyUtcDayKey(now),
    getLegacyUtcDayKey(new Date(now.getTime() + 24 * 60 * 60 * 1000)),
    todayKey, // correct bucket last so it wins on conflict
  ];
  const seen = new Set<string>();
  const result: Record<string, DailyRead> = {};
  for (const bucketKey of candidateBuckets) {
    if (seen.has(bucketKey)) continue;
    seen.add(bucketKey);
    const bucket = reads[bucketKey];
    if (!bucket) continue;
    for (const [readKey, read] of Object.entries(bucket)) {
      if (readEffectiveDayKey(read) === todayKey) result[readKey] = read;
    }
  }
  return result;
}

/** Returns the read for a specific track today, or null. */
export function getTodayTrackRead(data: UserData, trackId: string): DailyRead | null {
  return getTodayReadMap(data)[getDailyReadKey(trackId)] ?? null;
}

/** Returns the read for a specific name inside a names track today, or null. */
export function getTodayNameRead(
  data: UserData,
  trackId: string,
  nameId: string
): DailyRead | null {
  return getTodayReadMap(data)[getDailyReadKey(trackId, nameId)] ?? null;
}

/** Returns any read from today (for display purposes on home/trace pages). */
export function getTodayRead(data: UserData): DailyRead | null {
  const values = Object.values(getTodayReadMap(data));
  return values.length > 0 ? values[values.length - 1] : null;
}

/**
 * [P0-02] The app-day key a just-completed item was bucketed under. The
 * completion screen is a separate route, so it recovers the session day from the
 * stored read instead of recomputing `now` (which may have crossed 04:00). Used
 * to keep the reflection + pledge on the same day as the story.
 */
export function getRitualDayKey(
  data: UserData,
  trackId: string,
  opts: { nameId?: string; storyId?: number } = {}
): string {
  const readKey = getDailyReadKey(trackId, opts.nameId);
  let best: DailyRead | null = null;
  for (const bucket of Object.values(data.dailyReads ?? {})) {
    const read = bucket?.[readKey];
    if (!read) continue;
    if (opts.storyId != null && read.storyId !== opts.storyId) continue;
    if (!best || read.completedAt > best.completedAt) best = read;
  }
  if (!best) {
    // No matching read (e.g. /complete reached without a recorded completion).
    // Don't silently mislabel the day — warn in dev; last-resort fallback only.
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[kanah] getRitualDayKey: no read found for ${trackId} ${JSON.stringify(opts)}; falling back to current app day.`
      );
    }
    return getAppDayKey();
  }
  return best.dayKey ?? getAppDayKey(new Date(best.completedAt));
}

export function isDevUnlimited(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("kanah_dev_unlimited") === "1";
}

// [P0-02] `dayKey` lets the caller pin the bucket to the session's start day
// (captured when the story opened), so a session crossing the 4am boundary is
// recorded on the day it began. Defaults to the current key.
export function completeStory(
  trackId: string,
  storyId: number,
  dayKey: string = getTodayString()
): void {
  const data = getUserData();
  const current = data.completedStoriesByTrack[trackId] ?? [];
  if (!current.includes(storyId)) {
    data.completedStoriesByTrack[trackId] = uniqueSorted([...current, storyId]);
  }
  data.activeTrackId = trackId;
  const today = dayKey;
  if (!data.dailyReads[today]) data.dailyReads[today] = {};
  const readKey = getDailyReadKey(trackId);
  if (!data.dailyReads[today][readKey]) {
    data.dailyReads[today][readKey] = {
      trackId,
      itemType: "story",
      storyId,
      completedAt: new Date().toISOString(),
      dayKey: today,
    };
  }
  saveUserData(data);
}

export function completeName(
  trackId: string,
  nameId: string,
  dayKey: string = getTodayString()
): void {
  const data = getUserData();
  const current = data.completedNamesByTrack[trackId] ?? [];
  if (!current.includes(nameId)) {
    data.completedNamesByTrack[trackId] = [...current, nameId];
  }
  data.activeTrackId = trackId;
  const today = dayKey;
  if (!data.dailyReads[today]) data.dailyReads[today] = {};
  const readKey = getDailyReadKey(trackId, nameId);
  if (!data.dailyReads[today][readKey]) {
    data.dailyReads[today][readKey] = {
      trackId,
      itemType: "name",
      nameId,
      completedAt: new Date().toISOString(),
      dayKey: today,
    };
  }
  saveUserData(data);
}

export function completeNameStory(
  trackId: string,
  nameId: string,
  storyId: number,
  dayKey: string = getTodayString()
): void {
  const data = getUserData();
  if (!data.completedNameStoriesByTrack[trackId]) {
    data.completedNameStoriesByTrack[trackId] = {};
  }
  const current = data.completedNameStoriesByTrack[trackId][nameId] ?? [];
  if (!current.includes(storyId)) {
    data.completedNameStoriesByTrack[trackId][nameId] = uniqueSorted([...current, storyId]);
  }
  data.activeTrackId = trackId;
  const today = dayKey;
  if (!data.dailyReads[today]) data.dailyReads[today] = {};
  const readKey = getDailyReadKey(trackId, nameId);
  if (!data.dailyReads[today][readKey]) {
    data.dailyReads[today][readKey] = {
      trackId,
      itemType: "nameStory",
      nameId,
      storyId,
      completedAt: new Date().toISOString(),
      dayKey: today,
    };
  }
  saveUserData(data);
}

export function getTodayNameStoryRead(data: UserData, trackId: string, nameId: string): DailyRead | null {
  const read = getTodayNameRead(data, trackId, nameId);
  if (!read) return null;
  if (read.itemType === "nameStory" && read.nameId === nameId) return read;
  return null;
}

// [P0-02] `dayKey` ties the reflection to the *same* app-day the story session
// began on. Without it, choosing a sentence at 04:06 after opening the story at
// 03:55 would land on the next day. Defaults to the current key.
export function saveReflection(
  trackId: string,
  storyId: number,
  selectedLine: string,
  dayKey: string = getTodayString()
): void {
  const data = getUserData();
  const idx = data.reflections.findIndex(
    (reflection) =>
      reflection.trackId === trackId && reflection.storyId === storyId
  );
  const entry: Reflection = {
    trackId,
    storyId,
    selectedLine,
    createdAt: new Date().toISOString(),
    dayKey,
  };
  if (idx >= 0) data.reflections[idx] = entry;
  else data.reflections.push(entry);
  saveUserData(data);
}

export function savePledge(
  trackId: string,
  storyId: number,
  pledgeText: string,
  dayKey: string = getTodayString()
): void {
  const data = getUserData();
  const idx = data.pledges.findIndex(
    (pledge) => pledge.trackId === trackId && pledge.storyId === storyId
  );
  const entry: Pledge = {
    trackId,
    storyId,
    pledgeText,
    status: "pending",
    createdAt: new Date().toISOString(),
    dayKey,
    dueDate: addAppDays(dayKey, 1),
  };
  if (idx >= 0) data.pledges[idx] = entry;
  else data.pledges.push(entry);
  saveUserData(data);
}

/** The latest pledge still awaiting review (status === "pending"). */
export function getActivePledge(data: UserData): Pledge | null {
  const pending = data.pledges.filter((pledge) => pledge.status === "pending");
  return pending.length > 0 ? pending[pending.length - 1] : null;
}

/**
 * [P0-04 / P1] The single pledge to surface for review on the home screen:
 * the most recent *due* pending pledge, preferring the active track. Never a
 * debt list — at most one. Pledges older than `maxAgeDays` are excluded (P1-06).
 */
export function getReviewCandidate(
  data: UserData,
  activeTrackId: string | null,
  todayKey: string = getAppDayKey(),
  maxAgeDays = 6
): Pledge | null {
  const due = data.pledges.filter(
    (p) =>
      p.status === "pending" &&
      p.dueDate != null &&
      p.dueDate <= todayKey &&
      daysBetweenKeys(p.dueDate, todayKey) <= maxAgeDays
  );
  if (due.length === 0) return null;
  const byNewestDue = [...due].sort((a, b) =>
    (a.dueDate ?? "") < (b.dueDate ?? "") ? 1 : -1
  );
  const activeDue = byNewestDue.filter((p) => p.trackId === activeTrackId);
  return (activeDue[0] ?? byNewestDue[0]) ?? null;
}

/** Whole app-days between two YYYY-MM-DD keys (b - a). */
export function daysBetweenKeys(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const da = Date.UTC(ay, am - 1, ad);
  const db = Date.UTC(by, bm - 1, bd);
  return Math.round((db - da) / (24 * 60 * 60 * 1000));
}

/** [P0-04] Record the user's review answer; moves the pledge to "reviewed". */
export function reviewPledge(
  trackId: string,
  storyId: number,
  answer: PledgeReviewAnswer,
  dayKey: string = getAppDayKey()
): void {
  const data = getUserData();
  const idx = data.pledges.findIndex(
    (pledge) =>
      pledge.trackId === trackId &&
      pledge.storyId === storyId &&
      pledge.status === "pending"
  );
  if (idx < 0) return;
  data.pledges[idx] = {
    ...data.pledges[idx],
    status: "reviewed",
    review: { dayKey, answer },
  };
  saveUserData(data);
}

/** [P0-04 / P1-07] Quietly close an aged-out pledge without judgement. */
export function softClosePledge(trackId: string, storyId: number): void {
  const data = getUserData();
  const idx = data.pledges.findIndex(
    (pledge) =>
      pledge.trackId === trackId &&
      pledge.storyId === storyId &&
      pledge.status === "pending"
  );
  if (idx < 0) return;
  data.pledges[idx] = { ...data.pledges[idx], status: "soft_closed" };
  saveUserData(data);
}

export function initUser(): void {
  const data = getUserData();
  if (!data.firstOpenedAt) {
    data.firstOpenedAt = new Date().toISOString().split("T")[0];
  }
  if (!data.activeTrackId || !getTrack(data.activeTrackId)) {
    data.activeTrackId = getDefaultActiveTrackId();
  }
  saveUserData(data);
}

export function isDevMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("kanah_dev") === "1";
}

export function resetUserData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export function formatArabicDate(isoDate: string): string {
  // Accepts both a YYYY-MM-DD day key and a full ISO timestamp.
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("ar-u-ca-gregory", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
