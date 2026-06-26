"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getName, getNamesTrack, toArabicNumeral } from "@/data/days";
import {
  completeNameStory,
  getAppDayKey,
  getTodayNameRead,
  getUserData,
  isDevMode,
  isDevUnlimited,
  UserData,
} from "@/lib/storage";
import StoryReader, { DailyRestNotice } from "@/components/StoryReader";

export default function NameStoryPage() {
  const params = useParams();
  const router = useRouter();
  const trackId = String(params.trackId);
  const nameId = String(params.nameId);
  const storyId = Number(params.storyId);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [devUnlimited, setDevUnlimited] = useState(false);
  const [completing, setCompleting] = useState(false);
  const sessionDayKey = useRef<string | null>(null);

  useEffect(() => {
    if (sessionDayKey.current === null) sessionDayKey.current = getAppDayKey();
    setUserData(getUserData());
    setDevMode(isDevMode());
    setDevUnlimited(isDevUnlimited());
  }, [trackId]);

  const track = getNamesTrack(trackId);
  const name = getName(trackId, nameId);
  const story = name?.stories?.find((s) => s.id === storyId) ?? null;

  const isCompleted = userData
    ? (userData.completedNameStoriesByTrack?.[trackId]?.[nameId] ?? []).includes(storyId)
    : false;

  const todayTrackRead = userData ? getTodayNameRead(userData, trackId, nameId) : null;
  const blockedByDaily =
    !devUnlimited &&
    !isCompleted &&
    !!todayTrackRead &&
    !(
      todayTrackRead.itemType === "nameStory" &&
      todayTrackRead.nameId === nameId &&
      todayTrackRead.storyId === storyId
    );

  useEffect(() => {
    if (!track || !name || !story) {
      router.replace(`/tracks/${trackId}/names/${nameId}/stories`);
    }
  }, [track, name, story, trackId, nameId, router]);

  if (!userData || !track || !name || !story) return null;

  if (!story.contentReady && !devMode) {
    router.replace(`/tracks/${trackId}/names/${nameId}/stories`);
    return null;
  }

  if (blockedByDaily) {
    return (
      <DailyRestNotice
        title="خذ وقتك مع معنى هذا الاسم"
        body="خذ وقتك مع معنى هذا الاسم… القصة التالية تُفتح غداً."
        extra="يمكنك اختيار اسم آخر اليوم."
      />
    );
  }

  function handleComplete() {
    setCompleting(true);
    completeNameStory(trackId, nameId, storyId, sessionDayKey.current ?? undefined);
    router.push(`/tracks/${trackId}/names/${nameId}/stories/${storyId}/complete`);
  }

  return (
    <StoryReader
      topKicker={`${name.name} · اليوم ${toArabicNumeral(story.storyNumber)}`}
      topTitle={story.title}
      readingTime={story.readingTime}
      heroKicker={`اليوم ${toArabicNumeral(story.storyNumber)} من ${toArabicNumeral(
        name.stories!.length
      )}`}
      heroWord={name.name}
      heroTitle={story.title}
      heroSubtitle={name.title}
      story={story.story}
      hiddenMeaning={story.hiddenMeaning}
      lifeImpact={story.lifeImpact}
      impactLabel="أثره في حياتك"
      reflectionQuestion={story.reflectionQuestion}
      dailyAction={story.dailyAction}
      isCompleted={isCompleted}
      completedLabel="أتممت هذه القصة بالفعل"
      completing={completing}
      onComplete={handleComplete}
    />
  );
}
