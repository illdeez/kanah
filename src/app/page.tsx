"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
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

  const todayTrack = todayRead ? getTrack(todayRead.trackId) : null;
  const todayStory =
    todayRead && todayRead.itemType !== "name" && todayRead.storyId != null
      ? getStory(todayRead.trackId, todayRead.storyId)
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
    <main className="flex flex-col min-h-screen pb-28">

      {/* ── HEADER ── */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="px-6 pt-12 pb-6"
      >
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.3em] text-kanah-accent-muted mb-1.5">
              كَنْه
            </p>
            <h2 className="text-[30px] font-extrabold text-kanah-text leading-none">
              اليوم
            </h2>
          </div>
          <p className="text-[11px] text-kanah-locked pb-0.5">معانٍ تعيش معك</p>
        </div>
        <div className="mt-5 h-px bg-kanah-border" />
      </motion.header>

      {/* ── DONE TODAY ── */}
      {activeTrackHasDoneToday &&
      activeTrack &&
      activeTrackTodayRead &&
      activeTrackTodayStory ? (
        <section className="px-6">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="bg-kanah-card border border-kanah-border rounded-[28px] p-6"
          >
            {/* Completion badge */}
            <motion.div variants={item} className="mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-kanah-completed/10 text-kanah-completed text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-kanah-completed" />
                قصة اليوم اكتملت
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={item}
              className="text-[26px] font-extrabold text-kanah-text leading-[1.45] mb-1"
            >
              أتممت قصة اليوم
              <br />
              <span className="text-kanah-accent">من {activeTrack.word}</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="text-[15px] font-semibold text-kanah-muted mb-5"
            >
              {activeTrackTodayStory.title}
            </motion.p>

            <motion.p
              variants={item}
              className="text-[13px] text-kanah-locked leading-[1.9] border-t border-kanah-border pt-4 mb-5"
            >
              يمكنك عيش أكثر من معنى اليوم، لكن كل مسار يفتح لك قصة واحدة يومياً.
            </motion.p>

            {/* Reflection */}
            {todayReflection && (
              <motion.div
                variants={item}
                className="bg-kanah-accent-subtle rounded-2xl px-5 py-4 mb-5"
              >
                <p className="text-[10px] font-semibold text-kanah-accent-muted tracking-[0.2em] uppercase mb-2.5">
                  الجملة التي بقيت فيك
                </p>
                <p className="text-[15px] leading-[2] text-kanah-text font-medium">
                  {todayReflection.selectedLine}
                </p>
              </motion.div>
            )}

            {/* Pledge */}
            {activePledge && activePledgeTrack && activePledgeStory && (
              <motion.div
                variants={item}
                className="border-t border-kanah-border pt-5"
              >
                <p className="text-[10px] font-semibold text-kanah-accent-muted tracking-[0.2em] uppercase mb-2">
                  هل اختبرت تعهدك اليوم؟
                </p>
                <p className="text-[14px] text-kanah-text leading-[2] mb-4">
                  {activePledge.pledgeText}
                </p>

                {/* Primary — full width */}
                <button
                  onClick={() => handlePledgeOutcome("done")}
                  className="w-full rounded-2xl bg-kanah-accent text-white py-3.5 text-[14px] font-semibold mb-2.5 active:scale-[0.98] transition-transform"
                >
                  نعم، طبّقته
                </button>

                {/* Secondary — 3 equal */}
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
                      className="rounded-xl border border-kanah-border bg-kanah-surface py-2.5 text-[11.5px] font-medium text-kanah-muted active:scale-[0.97] transition-transform"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </section>
      ) : (
        /* ── CHOOSE TODAY ── */
        <section className="px-6">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="bg-kanah-card border border-kanah-border rounded-[28px] p-6 mb-4"
          >
            <motion.p
              variants={item}
              className="text-[10px] font-semibold text-kanah-accent-muted tracking-[0.2em] uppercase mb-3"
            >
              {activeTrack ? "مسارك الآن" : "ابدأ رحلتك"}
            </motion.p>

            <motion.h1
              variants={item}
              className="text-[26px] font-extrabold text-kanah-text leading-[1.45] mb-2"
            >
              {activeTrack ? (
                <>
                  تابع رحلتك
                  <br />
                  <span className="text-kanah-accent">مع {activeTrack.word}</span>
                </>
              ) : (
                "اختر مساراً تبدأ معه"
              )}
            </motion.h1>

            <motion.p
              variants={item}
              className="text-[13px] text-kanah-muted leading-[1.9] mb-6"
            >
              {activeTrack
                ? "كل مسار يفتح لك قصة واحدة يومياً."
                : "اختر المسار الذي تريد أن تعيش معه اليوم."}
            </motion.p>

            {activeTrack && activeTrackNextStory ? (
              <motion.div variants={item} className="flex flex-col gap-3">
                {/* Story preview — tinted bg, no redundant border */}
                <div className="rounded-2xl bg-kanah-accent-subtle px-5 py-4">
                  <p className="text-[11px] text-kanah-accent-muted mb-1.5">
                    القصة {toArabicNumeral(activeTrackNextStory.storyNumber)} من{" "}
                    {toArabicNumeral(activeTrack.totalStories)}
                  </p>
                  <p className="text-[19px] font-bold text-kanah-accent leading-snug mb-1">
                    {activeTrackNextStory.title}
                  </p>
                  <p className="text-[12px] text-kanah-muted">{activeTrack.subtitle}</p>
                </div>

                <Link
                  href={`/tracks/${activeTrack.id}/stories/${activeTrackNextStory.id}`}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-[15px] font-semibold bg-kanah-accent text-white shadow-accent active:scale-[0.98] transition-transform"
                >
                  تابع قصة اليوم
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </Link>
              </motion.div>
            ) : (
              <motion.div variants={item} className="flex flex-col gap-2.5">
                {readyTracks.map((track) => {
                  const completed =
                    userData.completedStoriesByTrack[track.id]?.length ?? 0;
                  return (
                    <Link
                      key={track.id}
                      href={`/tracks/${track.id}`}
                      className="flex items-center justify-between rounded-2xl border border-kanah-border bg-kanah-surface px-5 py-4 active:scale-[0.98] transition-transform"
                    >
                      <div>
                        <p className="text-[17px] font-bold text-kanah-accent">
                          {track.word}
                        </p>
                        <p className="text-[11px] text-kanah-muted mt-0.5">
                          {track.subtitle}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-kanah-locked">
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

      {/* ── LIBRARY ── */}
      <section className="px-6 pt-3">
        <Link
          href="/library"
          className="flex items-center justify-between rounded-[24px] border border-kanah-border bg-kanah-surface px-6 py-5 active:scale-[0.99] transition-transform hover:bg-kanah-card"
        >
          <div>
            <p className="text-[10px] font-semibold text-kanah-accent-muted tracking-[0.2em] uppercase mb-2">
              المكتبة
            </p>
            <p className="text-[18px] font-bold text-kanah-text mb-1">
              استكشف مكتبة الكلمات
            </p>
            <p className="text-[12px] text-kanah-muted leading-[1.8]">
              كل كلمة مسار قصصي كامل.
            </p>
          </div>
          <ChevronLeft
            size={18}
            strokeWidth={1.5}
            className="text-kanah-accent-muted flex-shrink-0 ms-2"
          />
        </Link>
      </section>

      {/* ── STATS ── */}
      <section className="px-6 pt-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-kanah-card rounded-2xl px-5 pt-5 pb-4 border border-kanah-border">
            <span className="text-[42px] font-extrabold text-kanah-accent leading-none block mb-2 tabular-nums">
              {toArabicNumeral(totalCompleted)}
            </span>
            <span className="text-[11px] text-kanah-muted leading-snug block">
              قصة أتممتها
            </span>
          </div>
          <div className="bg-kanah-card rounded-2xl px-5 pt-5 pb-4 border border-kanah-border">
            <span className="text-[42px] font-extrabold text-kanah-accent leading-none block mb-2 tabular-nums">
              {toArabicNumeral(totalDays)}
            </span>
            <span className="text-[11px] text-kanah-muted leading-snug block">
              يوم عشت فيه معنى
            </span>
          </div>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}
