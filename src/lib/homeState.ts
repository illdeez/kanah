// [P0-05] Pure resolver for the "اليوم" (Home) screen state. All branching lives
// here so page.tsx renders from one contract. No UI strings here — those belong
// in the component. The review gate stays behind a feature flag (P1 activates it).
//
// Note: storyId is `number` throughout this codebase (not string), so the Ref
// types use number too — a deliberate deviation from the original sketch.

import {
  getNextAvailableStory,
  getStory,
  getTrack,
  hasReadyStories,
  isWordTrack,
  wordTracks,
  type WordTrack,
} from "@/data/days";
import {
  daysBetweenKeys,
  getAppDayKey,
  getReviewCandidate,
  getTodayTrackRead,
  type DailyRead,
  type Pledge,
  type Reflection,
  type UserData,
} from "@/lib/storage";

export type TodayStoryRef = {
  kind: "track_story";
  trackId: string;
  storyId: number;
  title: string;
  href: string;
  index: number;
  total: number;
};

export type ReviewCandidateRef = {
  pledgeId: string;
  trackId: string;
  storyId: number;
  text: string;
  dayKey: string;
  dueDate: string;
  ageDays: number;
};

export type ResurfacedSentenceRef = {
  id: string;
  text: string;
  dayKey: string;
  trackId?: string;
  storyId?: number;
  ageDays: number;
};

export type NoActiveTrackState = {
  type: "NO_ACTIVE_TRACK";
  appDayKey: string;
  reason: "none_selected" | "track_completed" | "track_unavailable";
  activeTrackId?: string | null;
};

export type ReviewGateState = {
  type: "REVIEW_GATE";
  appDayKey: string;
  activeTrackId: string;
  story: TodayStoryRef;
  pledge: ReviewCandidateRef;
  mode: "fresh_required_decision";
};

export type StoryAvailableState = {
  type: "STORY_AVAILABLE";
  appDayKey: string;
  activeTrackId: string;
  story: TodayStoryRef;
  optionalLateReview?: ReviewCandidateRef;
  resurfacedSentence?: ResurfacedSentenceRef;
};

export type CompletedTodayState = {
  type: "COMPLETED_TODAY";
  appDayKey: string;
  activeTrackId: string;
  story: TodayStoryRef;
  read: DailyRead;
  todayReflection?: Reflection | null;
  todayPledge?: Pledge | null;
  needsEffectCompletion: boolean;
};

export type TodayHomeState =
  | NoActiveTrackState
  | ReviewGateState
  | StoryAvailableState
  | CompletedTodayState;

export type TodayHomeFeatureFlags = {
  enableReviewGate: boolean;
};

function storyRef(track: WordTrack, story: { id: number; storyNumber: number; title: string }): TodayStoryRef {
  return {
    kind: "track_story",
    trackId: track.id,
    storyId: story.id,
    title: story.title,
    href: `/tracks/${track.id}/stories/${story.id}`,
    index: story.storyNumber,
    total: track.totalStories,
  };
}

function candidateRef(pledge: Pledge, appDayKey: string): ReviewCandidateRef {
  return {
    pledgeId: `${pledge.trackId}:${pledge.storyId}`,
    trackId: pledge.trackId,
    storyId: pledge.storyId,
    text: pledge.pledgeText,
    dayKey: pledge.dayKey ?? "",
    dueDate: pledge.dueDate ?? "",
    ageDays: pledge.dueDate ? daysBetweenKeys(pledge.dueDate, appDayKey) : 0,
  };
}

/** Resolve the active *word* track for the daily story flow, mirroring the
 *  legacy page.tsx fallback (active track → first ready → first). */
function resolveActiveWordTrack(
  activeTrackId: string | null,
  devMode: boolean
): WordTrack | null {
  const wordOnly = wordTracks.filter(isWordTrack);
  const raw = activeTrackId ? getTrack(activeTrackId) : null;
  if (raw && isWordTrack(raw)) return raw;
  const ready = wordOnly.filter((t) => hasReadyStories(t, devMode));
  return ready[0] ?? wordOnly[0] ?? null;
}

export function resolveTodayHomeState(input: {
  data: UserData;
  appDayKey?: string;
  devMode?: boolean;
  devUnlimited?: boolean;
  flags?: Partial<TodayHomeFeatureFlags>;
}): TodayHomeState {
  const flags: TodayHomeFeatureFlags = { enableReviewGate: false, ...input.flags };
  const { data } = input;
  const appDayKey = input.appDayKey ?? getAppDayKey();
  const devMode = input.devMode ?? false;
  const devUnlimited = input.devUnlimited ?? false;

  if (!data.activeTrackId) {
    return { type: "NO_ACTIVE_TRACK", appDayKey, reason: "none_selected", activeTrackId: null };
  }

  const track = resolveActiveWordTrack(data.activeTrackId, devMode);
  if (!track) {
    return {
      type: "NO_ACTIVE_TRACK",
      appDayKey,
      reason: "track_unavailable",
      activeTrackId: data.activeTrackId,
    };
  }
  const activeTrackId = track.id;

  // Completed today? (the daily lock) — unless dev-unlimited.
  const todayRead = getTodayTrackRead(data, activeTrackId);
  const completedToday =
    !devUnlimited &&
    !!todayRead &&
    todayRead.itemType !== "name" &&
    todayRead.storyId != null;

  if (completedToday && todayRead) {
    const completedStory =
      todayRead.storyId != null ? getStory(activeTrackId, todayRead.storyId) : undefined;
    const todayReflection =
      data.reflections.find(
        (r) => r.trackId === activeTrackId && r.storyId === todayRead.storyId
      ) ?? null;
    const todayPledge =
      data.pledges.find(
        (p) => p.trackId === activeTrackId && p.storyId === todayRead.storyId
      ) ?? null;
    return {
      type: "COMPLETED_TODAY",
      appDayKey,
      activeTrackId,
      story: completedStory
        ? storyRef(track, completedStory)
        : {
            kind: "track_story",
            trackId: activeTrackId,
            storyId: todayRead.storyId ?? -1,
            title: track.word,
            href: `/tracks/${activeTrackId}`,
            index: 0,
            total: track.totalStories,
          },
      read: todayRead,
      todayReflection,
      todayPledge,
      needsEffectCompletion: !todayReflection || !todayPledge,
    };
  }

  const nextStory = getNextAvailableStory(
    activeTrackId,
    data.completedStoriesByTrack,
    devMode
  );
  if (!nextStory) {
    return {
      type: "NO_ACTIVE_TRACK",
      appDayKey,
      reason: "track_completed",
      activeTrackId,
    };
  }

  const story = storyRef(track, nextStory);
  const candidate = getReviewCandidate(data, activeTrackId, appDayKey);
  const ref = candidate ? candidateRef(candidate, appDayKey) : undefined;

  // Fresh (yesterday's) pledge → gate, but only when the flag is on and it
  // wasn't already deferred today.
  if (
    flags.enableReviewGate &&
    candidate &&
    ref &&
    ref.ageDays === 0 &&
    candidate.lastDeferredDayKey !== appDayKey
  ) {
    return {
      type: "REVIEW_GATE",
      appDayKey,
      activeTrackId,
      story,
      pledge: ref,
      mode: "fresh_required_decision",
    };
  }

  return {
    type: "STORY_AVAILABLE",
    appDayKey,
    activeTrackId,
    story,
    // A late (1–6 day) pledge rides above the story as an optional card, never a gate.
    optionalLateReview: ref && ref.ageDays >= 1 ? ref : undefined,
    // resurfacedSentence wired in P1-12.
  };
}
