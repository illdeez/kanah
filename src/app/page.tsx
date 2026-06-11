"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import {
  getNextAvailableStory,
  getStory,
  getTrack,
  hasReadyStories,
  isWordTrack,
  toArabicNumeral,
  wordTracks,
} from "@/data/days";
import {
  getActivePledge,
  getTodayRead,
  getTodayTrackRead,
  getUserData,
  initUser,
  isDevMode,
  isDevUnlimited,
  updatePledgeStatus,
  UserData,
} from "@/lib/storage";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";

const ease = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { ease, duration: 0.5 } },
};

export default function HomePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [devUnlimited, setDevUnlimited] = useState(false);

  useEffect(() => {
    initUser();
    setUserData(getUserData());
    setDevMode(isDevMode());
    setDevUnlimited(isDevUnlimited());
  }, []);

  if (!userData) return null;

  const todayRead = getTodayRead(userData);
  const wordOnlyTracks = wordTracks.filter((track) => isWordTrack(track));
  const readyTracks = wordOnlyTracks.filter((track) => hasReadyStories(track, devMode));
  const rawActiveTrack = userData.activeTrackId
    ? getTrack(userData.activeTrackId)
    : null;
  const activeTrack =
    rawActiveTrack && isWordTrack(rawActiveTrack)
      ? rawActiveTrack
      : readyTracks[0] ?? wordOnlyTracks[0] ?? null;
  const activePledge = getActivePledge(userData);
  const activePledgeTrack = activePledge ? getTrack(activePledge.trackId) : null;
  const activePledgeStory = activePledge
    ? getStory(activePledge.trackId, activePledge.storyId)
    : null;

  const todayStoryId = todayRead?.storyId ?? null;
  const todayReflection =
    todayRead && todayStoryId != null
      ? userData.reflections.find(
          (r) => r.trackId === todayRead.trackId && r.storyId === todayStoryId
        )
      : null;
  const activeTrackTodayRead =
    activeTrack ? getTodayTrackRead(userData, activeTrack.id) : null;
  const activeTrackHasDoneToday = !!activeTrackTodayRead && !devUnlimited;
  const activeTrackTodayStory =
    activeTrackTodayRead &&
    activeTrackTodayRead.itemType !== "name" &&
    activeTrackTodayRead.storyId != null
      ? getStory(activeTrackTodayRead.trackId, activeTrackTodayRead.storyId)
      : null;
  const activeTrackNextStory =
    activeTrack && isWordTrack(activeTrack)
      ? getNextAvailableStory(
          activeTrack.id,
          userData.completedStoriesByTrack,
          devMode
        )
      : null;

  const totalCompleted = Object.values(userData.completedStoriesByTrack).reduce(
    (s, a) => s + a.length,
    0
  );
  const totalDays = Object.keys(userData.dailyReads ?? {}).length;

  function handlePledgeOutcome(
    outcome: "done" | "tried" | "forgot" | "no_situation"
  ) {
    if (!activePledge) return;
    updatePledgeStatus(activePledge.trackId, activePledge.storyId, outcome);
    setUserData(getUserData());
  }

  return (
    <main className="flex flex-col min-h-screen pb-32 relative">
      <PageHeader title="اليوم" tagline="معانٍ تعيش معك" />

      {activeTrackHasDoneToday &&
      activeTrack &&
      activeTrackTodayRead &&
      activeTrackTodayStory ? (
        /* ── DONE TODAY ── */
        <section className="px-6 relative z-10">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="rounded-[32px] bg-kanah-card border border-kanah-border p-7 overflow-hidden relative"
          >
            <motion.div variants={item} className="mb-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-kanah-completed-subtle text-kanah-completed text-[11.5px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-kanah-completed" />
                قصة اليوم اكتملت
              </span>
            </motion.div>

            <motion.p
              variants={item}
              className="font-display text-[44px] text-kanah-accent leading-none mb-5"
            >
              {activeTrack.word}
            </motion.p>

            <motion.h1
              variants={item}
              className="text-[20px] font-bold text-kanah-text leading-[1.6] mb-1.5"
            >
              أتممت قصة اليوم
            </motion.h1>

            <motion.p
              variants={item}
              className="text-[14.5px] text-kanah-muted mb-6"
            >
              {activeTrackTodayStory.title}
            </motion.p>

            {todayReflection && (
              <motion.div
                variants={item}
                className="rounded-[22px] bg-kanah-accent-subtle px-6 py-5 mb-6"
              >
                <p className="text-[10.5px] font-semibold text-kanah-accent-muted tracking-[0.18em] mb-3">
                  الجملة التي بقيت فيك
                </p>
                <p className="font-display text-[18px] leading-[2] text-kanah-text">
                  {todayReflection.selectedLine}
                </p>
              </motion.div>
            )}

            {activePledge && activePledgeTrack && activePledgeStory && (
              <motion.div
                variants={item}
                className="border-t border-kanah-border pt-6"
              >
                <p className="text-[10.5px] font-semibold text-kanah-accent-muted tracking-[0.18em] mb-3">
                  هل اختبرت تعهدك اليوم؟
                </p>
                <p className="text-[14.5px] text-kanah-text leading-[2] mb-5">
                  {activePledge.pledgeText}
                </p>

                <button
                  onClick={() => handlePledgeOutcome("done")}
                  className="w-full rounded-full bg-kanah-accent text-kanah-on-accent py-3.5 text-[14px] font-bold mb-2.5 active:scale-[0.98] transition-transform shadow-accent"
                >
                  نعم، طبّقته
                </button>

                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { label: "حاولت", value: "tried" },
                      { label: "لم أنتبه", value: "forgot" },
                      { label: "لم أواجه موقفاً", value: "no_situation" },
                    ] as const
                  ).map(({ label, value }) => (
                    <button
                      key={value}
                      onClick={() => handlePledgeOutcome(value)}
                      className="rounded-full border border-kanah-border bg-kanah-surface py-2.5 text-[11.5px] font-medium text-kanah-muted active:scale-[0.97] transition-transform"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.p
              variants={item}
              className="text-[12.5px] text-kanah-locked leading-[1.9] border-t border-kanah-border pt-5 mt-6"
            >
              يمكنك عيش أكثر من معنى اليوم، لكن كل مسار يفتح لك قصة واحدة يومياً.
            </motion.p>
          </motion.div>
        </section>
      ) : (
        /* ── TODAY'S STORY ── */
        <section className="px-6 relative z-10">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="rounded-[32px] bg-kanah-card border border-kanah-border p-7 mb-4 relative overflow-hidden"
          >
            {/* warm glow inside the hero */}
            <div
              aria-hidden
              className="absolute -top-24 -start-24 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, var(--kanah-glow), transparent 70%)",
              }}
            />

            <motion.p
              variants={item}
              className="text-[10.5px] font-semibold text-kanah-accent-muted tracking-[0.2em] mb-5 relative"
            >
              {activeTrack ? "مسارك الآن" : "ابدأ رحلتك"}
            </motion.p>

            {activeTrack && (
              <motion.p
                variants={item}
                className="font-display text-[52px] text-kanah-accent leading-[1.1] mb-5 relative"
              >
                {activeTrack.word}
              </motion.p>
            )}

            <motion.p
              variants={item}
              className="text-[14px] text-kanah-muted leading-[1.9] mb-7 relative"
            >
              {activeTrack
                ? "كل مسار يفتح لك قصة واحدة يومياً."
                : "اختر المسار الذي تريد أن تعيش معه اليوم."}
            </motion.p>

            {activeTrack && activeTrackNextStory ? (
              <motion.div variants={item} className="flex flex-col gap-4 relative">
                <div className="border-s-2 border-kanah-accent ps-5 py-1">
                  <p className="text-[11px] text-kanah-accent-muted mb-1.5">
                    القصة {toArabicNumeral(activeTrackNextStory.storyNumber)} من{" "}
                    {toArabicNumeral(activeTrack.totalStories)}
                  </p>
                  <p className="text-[19px] font-bold text-kanah-text leading-snug mb-1">
                    {activeTrackNextStory.title}
                  </p>
                  <p className="text-[12px] text-kanah-muted">
                    {activeTrack.subtitle}
                  </p>
                </div>

                <Link
                  href={`/tracks/${activeTrack.id}/stories/${activeTrackNextStory.id}`}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-full text-[15px] font-bold bg-kanah-accent text-kanah-on-accent shadow-accent active:scale-[0.98] transition-transform"
                >
                  اقرأ قصة اليوم
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </Link>
              </motion.div>
            ) : (
              <motion.div variants={item} className="flex flex-col gap-2.5 relative">
                {readyTracks.map((track) => {
                  const completed =
                    userData.completedStoriesByTrack[track.id]?.length ?? 0;
                  return (
                    <Link
                      key={track.id}
                      href={`/tracks/${track.id}`}
                      className="flex items-center justify-between rounded-[22px] border border-kanah-border bg-kanah-surface px-5 py-4 active:scale-[0.98] transition-transform"
                    >
                      <div>
                        <p className="font-display text-[22px] text-kanah-accent leading-tight">
                          {track.word}
                        </p>
                        <p className="text-[11px] text-kanah-muted mt-1">
                          {track.subtitle}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-kanah-locked tabular-nums">
                          {toArabicNumeral(completed)}/
                          {toArabicNumeral(track.totalStories)}
                        </span>
                        <ChevronLeft
                          size={14}
                          strokeWidth={2}
                          className="text-kanah-locked"
                        />
                      </div>
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        </section>
      )}

      {/* ── LIBRARY LINK ── */}
      <section className="px-6 pt-4 relative z-10">
        <Link
          href="/library"
          className="flex items-center gap-4 rounded-[26px] border border-kanah-border bg-kanah-surface/60 px-6 py-5 active:scale-[0.99] transition-transform"
        >
          <span className="flex items-center justify-center w-11 h-11 rounded-full bg-kanah-accent-subtle text-kanah-accent shrink-0">
            <BookOpen size={19} strokeWidth={1.8} />
          </span>
          <div className="flex-1">
            <p className="text-[15.5px] font-bold text-kanah-text mb-0.5">
              مكتبة الكلمات
            </p>
            <p className="text-[12px] text-kanah-muted">
              كل كلمة مسار قصصي كامل.
            </p>
          </div>
          <ChevronLeft size={17} strokeWidth={1.6} className="text-kanah-locked" />
        </Link>
      </section>

      {/* ── STATS ── */}
      <section className="px-6 pt-4 relative z-10">
        <div className="flex rounded-[26px] border border-kanah-border bg-kanah-card overflow-hidden">
          <div className="flex-1 px-6 py-6">
            <span className="font-display text-[44px] text-kanah-accent leading-none block mb-2 tabular-nums">
              {toArabicNumeral(totalCompleted)}
            </span>
            <span className="text-[11.5px] text-kanah-muted leading-snug block">
              قصة أتممتها
            </span>
          </div>
          <div className="w-px bg-kanah-border my-5" />
          <div className="flex-1 px-6 py-6">
            <span className="font-display text-[44px] text-kanah-accent leading-none block mb-2 tabular-nums">
              {toArabicNumeral(totalDays)}
            </span>
            <span className="text-[11.5px] text-kanah-muted leading-snug block">
              يوم عشت فيه معنى
            </span>
          </div>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}
