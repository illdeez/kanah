"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getStory,
  getStoryStatus,
  getTrack,
  isWordTrack,
  toArabicNumeral,
} from "@/data/days";
import {
  completeStory,
  getTodayTrackRead,
  getUserData,
  isDevMode,
  isDevUnlimited,
  UserData,
} from "@/lib/storage";
import StoryReader, { DailyRestNotice } from "@/components/StoryReader";

export default function StoryPage() {
  const params = useParams();
  const router = useRouter();
  const trackId = String(params.trackId);
  const storyId = Number(params.storyId);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [devUnlimited, setDevUnlimited] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    setUserData(getUserData());
    setDevMode(isDevMode());
    setDevUnlimited(isDevUnlimited());
  }, [trackId]);

  const track = getTrack(trackId);
  const story = getStory(trackId, storyId);
  const isCompleted = userData
    ? (userData.completedStoriesByTrack[trackId] ?? []).includes(storyId)
    : false;
  const todayTrackRead = userData ? getTodayTrackRead(userData, trackId) : null;
  const blockedByDaily =
    !devUnlimited &&
    !isCompleted &&
    !!todayTrackRead &&
    !(todayTrackRead.itemType !== "name" && todayTrackRead.storyId === storyId);

  useEffect(() => {
    if (!track || !story) router.replace("/library");
  }, [track, story, router]);

  if (!userData || !track || !story) return null;

  const status = getStoryStatus(
    trackId,
    storyId,
    userData.completedStoriesByTrack,
    devMode
  );

  if (status === "locked") {
    router.replace(`/tracks/${trackId}`);
    return null;
  }

  if (blockedByDaily) {
    return (
      <DailyRestNotice
        title="خذ وقتك مع معنى اليوم"
        body="خذ وقتك مع معنى اليوم… القصة التالية في هذا المسار تُفتح غداً."
      />
    );
  }

  function handleComplete() {
    setCompleting(true);
    completeStory(trackId, storyId);
    router.push(`/tracks/${trackId}/stories/${storyId}/complete`);
  }

  return (
    <StoryReader
      topKicker={`${track.word} · القصة ${toArabicNumeral(story.storyNumber)}`}
      topTitle={story.title}
      readingTime={story.readingTime}
      heroKicker={`القصة ${toArabicNumeral(story.storyNumber)} من ${toArabicNumeral(
        isWordTrack(track) ? track.totalStories : 0
      )}`}
      heroWord={track.word}
      heroTitle={story.title}
      heroSubtitle={track.subtitle}
      story={story.story}
      hiddenMeaning={story.hiddenMeaning}
      lifeImpact={story.lifeImpact}
      impactLabel="أثرها في حياتك"
      reflectionQuestion={story.reflectionQuestion}
      dailyAction={story.dailyAction}
      isCompleted={isCompleted}
      completedLabel="أتممت هذه القصة بالفعل"
      completing={completing}
      onComplete={handleComplete}
    />
  );
}
