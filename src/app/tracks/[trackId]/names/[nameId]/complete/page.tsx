"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getName, getNamesTrack, toArabicNumeral } from "@/data/days";
import { getRitualDayKey, getUserData, savePledge, saveReflection } from "@/lib/storage";
import CompletionFlow from "@/components/CompletionFlow";

export default function CompleteNamePage() {
  const params = useParams();
  const router = useRouter();
  const trackId = String(params.trackId);
  const nameId = String(params.nameId);

  const track = getNamesTrack(trackId);
  const name = getName(trackId, nameId);

  useEffect(() => {
    if (!track || !name) router.replace(`/tracks/${trackId}/names`);
  }, [track, name, trackId, router]);

  if (!track || !name) return null;

  // Use name.number as the storyId integer for compatibility with Reflection/Pledge storage
  const storyIdForStorage = name.number;
  // [P0-02] Same app-day as the name was bucketed under.
  const ritualDayKey = getRitualDayKey(getUserData(), trackId, { nameId });

  function goBack() {
    setTimeout(() => router.replace(`/tracks/${trackId}/names`), 1000);
  }

  return (
    <CompletionFlow
      badgeText={`أتممت ${name.name} · ${toArabicNumeral(name.number)}`}
      word={name.name}
      itemTitle={name.title}
      selectedLines={name.selectedLines}
      pledgeText={name.pledgeText}
      pledgeHint="خذ من الاسم خطوة صغيرة تحوّل المعنى إلى سلوك."
      onSaveReflection={(line) => saveReflection(trackId, storyIdForStorage, line, ritualDayKey)}
      onSavePledge={() => {
        const pledgeText = name.pledgeText ?? "";
        if (pledgeText.trim()) {
          savePledge(trackId, storyIdForStorage, pledgeText, ritualDayKey);
        }
        goBack();
      }}
      onSkipLine={() => router.replace(`/tracks/${trackId}/names`)}
      onSkipPledge={goBack}
    />
  );
}
