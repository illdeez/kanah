"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getName, getNamesTrack, toArabicNumeral } from "@/data/days";
import {
  completeName,
  getTodayNameRead,
  getUserData,
  isDevMode,
  UserData,
} from "@/lib/storage";
import StoryReader, { DailyRestNotice } from "@/components/StoryReader";

export default function NamePage() {
  const params = useParams();
  const router = useRouter();
  const trackId = String(params.trackId);
  const nameId = String(params.nameId);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    setUserData(getUserData());
    setDevMode(isDevMode());
  }, [trackId]);

  const track = getNamesTrack(trackId);
  const name = getName(trackId, nameId);

  const isCompleted = userData
    ? (userData.completedNamesByTrack[trackId] ?? []).includes(nameId)
    : false;
  const todayTrackRead = userData ? getTodayNameRead(userData, trackId, nameId) : null;
  const blockedByDaily =
    !isCompleted &&
    !!todayTrackRead &&
    !(todayTrackRead.itemType === "name" && todayTrackRead.nameId === nameId);

  useEffect(() => {
    if (!track || !name) router.replace(`/tracks/${trackId}/names`);
    if (name && name.stories && name.stories.length > 0) {
      router.replace(`/tracks/${trackId}/names/${nameId}/stories`);
    }
  }, [track, name, trackId, nameId, router]);

  if (!userData || !track || !name) return null;
  if (name.stories && name.stories.length > 0) return null;

  if (!name.contentReady && !devMode) {
    router.replace(`/tracks/${trackId}/names`);
    return null;
  }

  if (blockedByDaily) {
    return (
      <DailyRestNotice
        title="خذ وقتك مع معنى هذا الاسم"
        body="خذ وقتك مع معنى هذا الاسم… القراءة التالية تُفتح غداً."
        extra="يمكنك اختيار اسم آخر اليوم."
      />
    );
  }

  function handleComplete() {
    setCompleting(true);
    completeName(trackId, nameId);
    router.push(`/tracks/${trackId}/names/${nameId}/complete`);
  }

  return (
    <StoryReader
      topKicker={`اسم من أسماء الله · ${name.name}`}
      topTitle={name.title}
      readingTime={name.readingTime}
      heroKicker={`الاسم ${toArabicNumeral(name.number)} من ${toArabicNumeral(
        track.totalNames
      )}`}
      heroWord={name.name}
      heroTitle={name.title}
      heroSubtitle={track.subtitle}
      story={name.story}
      hiddenMeaning={name.hiddenMeaning}
      lifeImpact={name.lifeImpact}
      impactLabel="أثره في حياتك"
      reflectionQuestion={name.reflectionQuestion}
      dailyAction={name.dailyAction}
      isCompleted={isCompleted}
      completedLabel="أتممت هذا الاسم بالفعل"
      completing={completing}
      onComplete={handleComplete}
    />
  );
}
