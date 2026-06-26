"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Clock, Lock } from "lucide-react";
import { motion } from "framer-motion";

import { getName, getNamesTrack, toArabicNumeral } from "@/data/days";
import {
  getTodayNameRead,
  getUserData,
  isDevMode,
  isDevUnlimited,
  setActiveTrack,
  UserData,
} from "@/lib/storage";
import BottomNav from "@/components/BottomNav";
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

export default function NameStoriesPage() {
  const params = useParams();
  const router = useRouter();
  const trackId = String(params.trackId);
  const nameId = String(params.nameId);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [devUnlimited, setDevUnlimited] = useState(false);

  useEffect(() => {
    const data = getUserData();
    setUserData(data);
    setDevMode(isDevMode());
    setDevUnlimited(isDevUnlimited());
  }, [trackId]);

  const track = getNamesTrack(trackId);
  const name = getName(trackId, nameId);

  useEffect(() => {
    if (!track || !name) router.replace(`/tracks/${trackId}/names`);
    if (name && (!name.stories || name.stories.length === 0)) {
      router.replace(`/tracks/${trackId}/names/${nameId}`);
    }
  }, [track, name, trackId, nameId, router]);

  if (!userData || !track || !name) return null;
  if (!name.stories || name.stories.length === 0) return null;

  const completedStoryIds =
    userData.completedNameStoriesByTrack?.[trackId]?.[nameId] ?? [];
  const todayTrackRead = getTodayNameRead(userData, trackId, nameId);
  const hasDoneToday = !!todayTrackRead && !devUnlimited;
  const progress = completedStoryIds.length;
  const total = name.stories.length;

  const nextStory = !hasDoneToday
    ? name.stories.find((s) => !completedStoryIds.includes(s.id))
    : undefined;
  const hasReadyStory = name.stories.some((story) => story.contentReady || devMode);

  function handleOpenTodayStory() {
    setActiveTrack(trackId);
    router.push(`/tracks/${trackId}/names/${nameId}/stories/${nextStory!.id}`);
  }

  return (
    <main className="flex flex-col min-h-screen pb-32 relative" dir="rtl">
      <TopBar kicker="أسماء الله الحسنى" title={`${name.name} · رحلة ١٠ أيام`} />

      {/* Hero */}
      <section className="px-6 pt-12 pb-8 text-center relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease, duration: 0.45 }}
          className="text-[11px] font-semibold text-kanah-accent-muted tracking-[0.2em] mb-6"
        >
          رحلة الاسم
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease, duration: 0.55 }}
          className="font-display text-[60px] text-kanah-text leading-[1.15] mb-6"
        >
          {name.name}
        </motion.h1>
        <p className="text-[15px] text-kanah-text leading-[2] mb-7 max-w-[42ch] mx-auto">
          {name.title}
        </p>

        <div className="rounded-[24px] bg-kanah-card border border-kanah-border p-5 text-start">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-kanah-accent-muted tracking-[0.15em]">
              التقدّم
            </span>
            <span className="text-[14px] font-bold text-kanah-accent tabular-nums">
              {toArabicNumeral(progress)} من {toArabicNumeral(total)}
            </span>
          </div>
          <div className="h-1.5 bg-kanah-border rounded-full overflow-hidden">
            <div
              className="h-full bg-kanah-accent rounded-full transition-all duration-700"
              style={{ width: `${total > 0 ? (progress / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </section>

      {/* CTA / daily limit */}
      {!hasReadyStory ? (
        <section className="px-6 pb-8 relative z-10">
          <div className="w-full text-center py-4 rounded-full text-[14.5px] font-semibold bg-kanah-surface border border-kanah-border text-kanah-muted">
            هذا المسار قيد الإعداد.
          </div>
        </section>
      ) : hasDoneToday ? (
        <section className="px-6 pb-8 relative z-10">
          <div className="w-full text-center py-4 rounded-[22px] text-[14px] leading-[1.8] bg-kanah-surface border border-kanah-border text-kanah-muted px-5">
            أتممت قصة اليوم مع هذا الاسم. القصة التالية تُفتح غداً.
          </div>
          <p className="text-[13px] text-kanah-accent text-center mt-3">
            يمكنك اختيار اسم آخر اليوم.
          </p>
        </section>
      ) : nextStory ? (
        <section className="px-6 pb-8 relative z-10">
          <button
            onClick={handleOpenTodayStory}
            className="block w-full text-center py-4 rounded-full text-[15.5px] font-semibold bg-kanah-text text-kanah-card shadow-soft active:scale-[0.98] transition-transform"
          >
            {progress > 0 ? "اقرأ قصة اليوم" : "ابدأ قصة اليوم"}
          </button>
        </section>
      ) : null}

      {/* Journey timeline */}
      <section className="px-6 pb-12 relative z-10">
        <h2 className="flex items-center gap-2.5 text-[11px] font-semibold text-kanah-accent-muted tracking-[0.18em] mb-5">
          <span className="w-5 h-px bg-kanah-accent-muted/60" />
          قصص الرحلة
        </h2>
        <motion.div
          variants={listContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-3"
        >
          {name.stories.map((story) => {
            const isCompleted = completedStoryIds.includes(story.id);
            const isComingSoon = !story.contentReady && !devMode;
            const isLocked =
              !isCompleted &&
              story.storyNumber > 1 &&
              !completedStoryIds.includes(story.id - 1) &&
              !devMode;
            const blockedByDaily =
              hasDoneToday && !isCompleted && !isLocked && !isComingSoon;
            const canOpen = !isComingSoon && !isLocked && !blockedByDaily;

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
                    isCompleted
                      ? "bg-kanah-completed-subtle text-kanah-completed"
                      : canOpen
                      ? "bg-kanah-accent-subtle text-kanah-accent"
                      : "bg-kanah-surface text-kanah-locked"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={18} />
                  ) : isLocked || blockedByDaily || isComingSoon ? (
                    <Lock size={15} />
                  ) : (
                    toArabicNumeral(story.storyNumber)
                  )}
                </span>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[15.5px] font-bold leading-[1.6] mb-1 ${
                      canOpen ? "text-kanah-text" : "text-kanah-locked"
                    }`}
                  >
                    {story.title}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-kanah-locked">
                    <span>اليوم {toArabicNumeral(story.storyNumber)}</span>
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
              <Link
                key={story.id}
                href={`/tracks/${trackId}/names/${nameId}/stories/${story.id}`}
              >
                {card}
              </Link>
            );
          })}
        </motion.div>
      </section>

      <BottomNav />
    </main>
  );
}
