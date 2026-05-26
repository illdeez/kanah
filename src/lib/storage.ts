import { getTrack, wordTracks } from "@/data/days";

export interface Reflection {
  trackId: string;
  storyId: number;
  selectedLine: string;
  createdAt: string;
}

export type PledgeStatus =
  | "active"
  | "done"
  | "tried"
  | "forgot"
  | "no_situation";

export interface Pledge {
  trackId: string;
  storyId: number;
  pledgeText: string;
  status: PledgeStatus;
  createdAt: string;
}

export interface DailyRead {
  trackId: string;
  itemType: "story" | "name";
  storyId?: number;
  nameId?: string;
  completedAt: string;
}

export interface UserData {
  completedStoriesByTrack: Record<string, number[]>;
  completedNamesByTrack: Record<string, string[]>;
  reflections: Reflection[];
  pledges: Pledge[];
  activeTrackId: string | null;
  firstOpenedAt: string | null;
  dailyReads: Record<string, DailyRead>;
}

const KEY = "kanah_data";
const LEGACY_PRIMARY_TRACK = "kazm-al-ghayz";

const defaults: UserData = {
  completedStoriesByTrack: {},
  completedNamesByTrack: {},
  reflections: [],
  pledges: [],
  activeTrackId: LEGACY_PRIMARY_TRACK,
  firstOpenedAt: null,
  dailyReads: {},
};

function getDefaultActiveTrackId(): string | null {
  return wordTracks[0]?.id ?? null;
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

  const reflections: Reflection[] = Array.isArray(source.reflections)
    ? source.reflections
        .map((entry) => {
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

          return {
            trackId,
            storyId,
            selectedLine,
            createdAt,
          };
        })
        .filter((entry): entry is Reflection => entry !== null)
    : [];

  const pledges: Pledge[] = Array.isArray(source.pledges)
    ? source.pledges
        .map((entry) => {
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
          const status =
            pledge.status === "active" ||
            pledge.status === "done" ||
            pledge.status === "tried" ||
            pledge.status === "forgot" ||
            pledge.status === "no_situation"
              ? pledge.status
              : "active";
          const createdAt =
            typeof pledge.createdAt === "string"
              ? pledge.createdAt
              : new Date().toISOString().split("T")[0];

          if (!storyId || !pledgeText.trim()) return null;

          return {
            trackId,
            storyId,
            pledgeText,
            status,
            createdAt,
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

  const dailyReads: Record<string, DailyRead> = {};
  if (source.dailyReads && typeof source.dailyReads === "object") {
    for (const [date, entry] of Object.entries(
      source.dailyReads as Record<string, unknown>
    )) {
      if (!entry || typeof entry !== "object") continue;
      const e = entry as Record<string, unknown>;
      if (typeof e.trackId !== "string" || typeof e.completedAt !== "string") continue;

      // Handle old entries that might not have itemType — default to "story"
      const itemType: "story" | "name" = e.itemType === "name" ? "name" : "story";

      if (itemType === "name") {
        const nameId = typeof e.nameId === "string" ? e.nameId : undefined;
        dailyReads[date] = {
          trackId: e.trackId,
          itemType: "name",
          nameId,
          completedAt: e.completedAt,
        };
      } else {
        const storyId = typeof e.storyId === "number" ? e.storyId : undefined;
        dailyReads[date] = {
          trackId: e.trackId,
          itemType: "story",
          storyId,
          completedAt: e.completedAt,
        };
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

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getTodayRead(data: UserData): DailyRead | null {
  return data.dailyReads?.[getTodayString()] ?? null;
}

export function isDevUnlimited(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("kanah_dev_unlimited") === "1";
}

export function completeStory(trackId: string, storyId: number): void {
  const data = getUserData();
  const current = data.completedStoriesByTrack[trackId] ?? [];
  if (!current.includes(storyId)) {
    data.completedStoriesByTrack[trackId] = uniqueSorted([...current, storyId]);
  }
  data.activeTrackId = trackId;
  const today = getTodayString();
  if (!data.dailyReads[today]) {
    data.dailyReads[today] = {
      trackId,
      itemType: "story",
      storyId,
      completedAt: new Date().toISOString(),
    };
  }
  saveUserData(data);
}

export function completeName(trackId: string, nameId: string): void {
  const data = getUserData();
  const current = data.completedNamesByTrack[trackId] ?? [];
  if (!current.includes(nameId)) {
    data.completedNamesByTrack[trackId] = [...current, nameId];
  }
  data.activeTrackId = trackId;
  const today = getTodayString();
  if (!data.dailyReads[today]) {
    data.dailyReads[today] = {
      trackId,
      itemType: "name",
      nameId,
      completedAt: new Date().toISOString(),
    };
  }
  saveUserData(data);
}

export function saveReflection(
  trackId: string,
  storyId: number,
  selectedLine: string
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
    createdAt: new Date().toISOString().split("T")[0],
  };
  if (idx >= 0) data.reflections[idx] = entry;
  else data.reflections.push(entry);
  saveUserData(data);
}

export function savePledge(
  trackId: string,
  storyId: number,
  pledgeText: string
): void {
  const data = getUserData();
  const idx = data.pledges.findIndex(
    (pledge) => pledge.trackId === trackId && pledge.storyId === storyId
  );
  const entry: Pledge = {
    trackId,
    storyId,
    pledgeText,
    status: "active",
    createdAt: new Date().toISOString().split("T")[0],
  };
  if (idx >= 0) data.pledges[idx] = entry;
  else data.pledges.push(entry);
  saveUserData(data);
}

export function getActivePledge(data: UserData): Pledge | null {
  const activePledges = data.pledges.filter((pledge) => pledge.status === "active");
  return activePledges.length > 0 ? activePledges[activePledges.length - 1] : null;
}

export function updatePledgeStatus(
  trackId: string,
  storyId: number,
  status: Exclude<PledgeStatus, "active">
): void {
  const data = getUserData();
  const idx = data.pledges.findIndex(
    (pledge) =>
      pledge.trackId === trackId &&
      pledge.storyId === storyId &&
      pledge.status === "active"
  );

  if (idx < 0) return;

  data.pledges[idx] = {
    ...data.pledges[idx],
    status,
  };
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
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("ar-u-ca-gregory", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
