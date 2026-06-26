"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Clock, Lock } from "lucide-react";
import { motion } from "framer-motion";

import {
  getNextAvailableStory,
  getStoryStatus,
  getTrack,
  getTrackProgress,
  hasReadyStories,
  isNamesTrack,
  isWordTrack,
  toArabicNumeral,
} from "@/data/days";
import {
  getTodayTrackRead,
  getUserData,
  isDevMode,
  isDevUnlimited,
  setActiveTrack,
  UserData,
} from "@/lib/storage";
import TopBar from "@/components/TopBar";

const ease = [0.16, 1, 0.3, 1] as const;
const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const listItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { ease, duration: 0.4 } },
};

export default function TrackPage() {
  const params = useParams();
  const router = useRouter();
  const trackId = String(params.trackId);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [devUnlimited, setDevUnlimited] = useState(false);

  useEffect(() => {
    const data = getUserData();
    setUserData(data);
    setDevMode(isDevMode());
    setDevUnlimited(isDevUnlimited());
  }, [trackId]);

  const track = getTrack(trackId);

  useEffect(() => {
    if (!track) router.replace("/library");
    if (track && isNamesTrack(track)) {
      router.replace(`/tracks/${trackId}/names`);
    }
  }, [track, trackId, router]);

  if (!userData || !track) return null;
  if (isNamesTrack(track)) return null;

  const wordTrack = isWordTrack(track) ? track : null;
  if (!wordTrack) return null;

  const isReady = hasReadyStories(wordTrack, devMode);
  const progress = getTrackProgress(wordTrack.id, userData.completedStoriesByTrack);
  const todayTrackRead = getTodayTrackRead(userData, trackId);
  const hasDoneToday = !!todayTrackRead && !devUnlimited;
  const nextStory = hasDoneToday
    ? null
    : getNextAvailableStory(wordTrack.id, userData.completedStoriesByTrack, devMode);

  function handleOpenTodayStory() {
    setActiveTrack(trackId);
    router.push(`/tracks/${trackId}/stories/${nextStory!.id}`);
  }

  return (
    <main className="flex flex-col min-h-screen pb-12 relative">
      <TopBar kicker="مسار الكلمة" title={wordTrack.word} />

      {/* Hero */}
      <section className="px-6 pt-12 pb-9 text-center relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease, duration: 0.45 }}
          className="text-[11px] font-semibold text-kanah-accent-muted tracking-[0.2em] mb-6"
        >
          {isReady ? "رحلة الكلمة" : "قريباً"}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease, duration: 0.55 }}
          className="font-display text-[58px] text-kanah-text leading-[1.2] mb-6"
        >
          {wordTrack.word}
        </motion.h1>
        <p className="text-[15.5px] text-kanah-text leading-[2] mb-2">
          {wordTrack.subtitle}
        </p>
        <p className="text-[13.5px] text-kanah-muted leading-[2] mb-8 max-w-[42ch] mx-auto">
          {wordTrack.description}
        </p>

        <div className="rounded-[24px] bg-kanah-card border border-kanah-border p-5 text-start">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-kanah-accent-muted tracking-[0.15em]">
              التقدّم
            </span>
            <span className="text-[14px] font-bold text-kanah-accent tabular-nums">
              {toArabicNumeral(progress)} / {toArabicNumeral(wordTrack.totalStories)}
            </span>
          </div>
          <div className="h-1.5 bg-kanah-border rounded-full overflow-hidden">
            <div
              className="h-full bg-kanah-accent rounded-full transition-all duration-700"
              style={{ width: `${wordTrack.totalStories > 0 ? (progress / wordTrack.totalStories) * 100 : 0}%` }}
            />
          </div>
        </div>
      </section>

      {!isReady ? (
        <section className="px-6 pb-8 relative z-10">
          <div className="w-full text-center py-4 rounded-full text-[14.5px] font-semibold bg-kanah-surface border border-kanah-border text-kanah-muted">
            هذا المسار قيد الإعداد.
          </div>
        </section>
      ) : hasDoneToday ? (
        <section className="px-6 pb-8 relative z-10">
          <div className="w-full text-center py-4 rounded-[22px] text-[14px] leading-[1.8] bg-kanah-surface border border-kanah-border text-kanah-muted px-5">
            أتممت قصة اليوم في هذا المسار. القصة التالية تُفتح غداً.
          </div>
        </section>
      ) : nextStory ? (
        <section className="px-6 pb-8 relative z-10">
          <button
            onClick={handleOpenTodayStory}
            className="block w-full text-center py-4 rounded-full text-[15.5px] font-semibold bg-kanah-text text-kanah-card shadow-soft active:scale-[0.98] transition-transform"
          >
            {progress > 0 ? "اقرأ قصة اليوم من هذا المسار" : "ابدأ قصة اليوم"}
          </button>
        </section>
      ) : null}

      {/* Stories timeline */}
      <section className="px-6 pb-12 relative z-10">
        <h2 className="flex items-center gap-2.5 text-[11px] font-semibold text-kanah-accent-muted tracking-[0.18em] mb-5">
          <span className="w-5 h-px bg-kanah-accent-muted/60" />
          قصص المسار
        </h2>
        <motion.div
          variants={listContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-3"
        >
          {wordTrack.stories.map((story) => {
            const status = getStoryStatus(
              wordTrack.id,
              story.id,
              userData.completedStoriesByTrack,
              devMode
            );
            const isComingSoon = !story.contentReady && !devMode;
            const blockedByDaily = hasDoneToday && status === "available";
            const canOpen = !isComingSoon && status !== "locked" && !blockedByDaily;

            const card = (
              <motion.div
                variants={listItem}
                whileTap={canOpen ? { scale: 0.985 } : {}}
                className={`flex items-center gap-4 rounded-[24px] border p-5 transition-colors ${
                  canOpen
                    ? "bg-kanah-card border-kanah-border"
                    : "bg-kanah-card border-kanah-border opacity-45"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-11 h-11 rounded-full shrink-0 font-display text-[19px] ${
                    status === "completed"
                      ? "bg-kanah-completed-subtle text-kanah-completed"
                      : canOpen
                      ? "bg-kanah-accent-subtle text-kanah-accent"
                      : "bg-kanah-surface text-kanah-locked"
                  }`}
                >
                  {status === "completed" ? (
                    <CheckCircle2 size={18} />
                  ) : status === "locked" || blockedByDaily || isComingSoon ? (
                    <Lock size={15} />
                  ) : (
                    toArabicNumeral(story.storyNumber)
                  )}
                </span>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[16px] font-bold leading-[1.6] mb-1 ${
                      canOpen ? "text-kanah-text" : "text-kanah-locked"
                    }`}
                  >
                    {story.title}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-kanah-locked">
                    <span>القصة {toArabicNumeral(story.storyNumber)}</span>
                    {canOpen && (
                      <>
                        <span className="w-0.5 h-0.5 rounded-full bg-kanah-locked" />
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {story.readingTime}
                        </span>
                      </>
                    )}
                    {blockedByDaily && <span>· تفتح غداً</span>}
                    {isComingSoon && <span>· قريباً</span>}
                  </div>
                </div>
              </motion.div>
            );

            if (!canOpen) return <div key={story.id}>{card}</div>;

            return (
              <Link key={story.id} href={`/tracks/${wordTrack.id}/stories/${story.id}`}>
                {card}
              </Link>
            );
          })}
        </motion.div>
      </section>
    </main>
  );
}
