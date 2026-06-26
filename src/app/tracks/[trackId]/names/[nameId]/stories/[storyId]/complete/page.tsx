"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getName, getNamesTrack, toArabicNumeral } from "@/data/days";
import { getRitualDayKey, getUserData, savePledge, saveReflection } from "@/lib/storage";
import CompletionFlow from "@/components/CompletionFlow";

export default function CompleteNameStoryPage() {
  const params = useParams();
  const router = useRouter();
  const trackId = String(params.trackId);
  const nameId = String(params.nameId);
  const storyId = Number(params.storyId);

  const track = getNamesTrack(trackId);
  const name = getName(trackId, nameId);
  const story = name?.stories?.find((s) => s.id === storyId) ?? null;

  useEffect(() => {
    if (!track || !name || !story) {
      router.replace(`/tracks/${trackId}/names/${nameId}/stories`);
    }
  }, [track, name, story, trackId, nameId, router]);

  if (!track || !name || !story) return null;

  // [P0-02] Same app-day the name-story was bucketed under.
  const ritualDayKey = getRitualDayKey(getUserData(), trackId, { nameId, storyId });

  function goBack() {
    setTimeout(
      () => router.replace(`/tracks/${trackId}/names/${nameId}/stories`),
      1000
    );
  }

  return (
    <CompletionFlow
      badgeText={`أتممت ${name.name} · اليوم ${toArabicNumeral(story.storyNumber)}`}
      word={name.name}
      itemTitle={story.title}
      selectedLines={story.selectedLines}
      pledgeText={story.pledgeText}
      pledgeHint="خذ من الاسم خطوة صغيرة تحوّل المعنى إلى سلوك."
      onSaveReflection={(line) => saveReflection(trackId, storyId, line, ritualDayKey)}
      onSavePledge={() => {
        const pledgeText = story.pledgeText ?? "";
        if (pledgeText.trim()) {
          savePledge(trackId, storyId, pledgeText, ritualDayKey);
        }
        goBack();
      }}
      onSkipLine={() => router.replace(`/tracks/${trackId}/names/${nameId}/stories`)}
      onSkipPledge={goBack}
    />
  );
}
