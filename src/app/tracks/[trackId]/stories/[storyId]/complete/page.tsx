"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getStory, getTrack, toArabicNumeral } from "@/data/days";
import { getRitualDayKey, getUserData, savePledge, saveReflection } from "@/lib/storage";
import CompletionFlow from "@/components/CompletionFlow";

export default function CompleteStoryPage() {
  const params = useParams();
  const router = useRouter();
  const trackId = String(params.trackId);
  const storyId = Number(params.storyId);

  const track = getTrack(trackId);
  const story = getStory(trackId, storyId);
  const isCompleted = !!getUserData().completedStoriesByTrack[trackId]?.includes(storyId);

  useEffect(() => {
    if (!track || !story || !isCompleted) router.replace(`/tracks/${trackId}`);
  }, [track, story, isCompleted, router, trackId]);

  if (!track || !story || !isCompleted) return null;

  // [P0-02] Pin reflection + pledge to the same app-day the story was bucketed under.
  const ritualDayKey = getRitualDayKey(getUserData(), trackId, { storyId });

  return (
    <CompletionFlow
      badgeText={`أتممت القصة ${toArabicNumeral(story.storyNumber)}`}
      word={track.word}
      itemTitle={story.title}
      selectedLines={story.selectedLines}
      pledgeText={story.pledgeText}
      pledgeHint="خذ من القصة خطوة صغيرة تحوّل المعنى إلى سلوك."
      onSaveReflection={(line) => saveReflection(trackId, storyId, line, ritualDayKey)}
      onSavePledge={() => {
        const pledgeText = story.pledgeText ?? "";
        if (!pledgeText.trim()) {
          setTimeout(() => router.replace(`/tracks/${trackId}`), 1000);
          return;
        }
        savePledge(trackId, storyId, pledgeText, ritualDayKey);
        setTimeout(() => router.replace("/"), 1000);
      }}
      onSkipLine={() => router.replace(`/tracks/${trackId}`)}
      onSkipPledge={() => setTimeout(() => router.replace("/"), 1000)}
    />
  );
}
