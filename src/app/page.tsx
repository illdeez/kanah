"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getStory, getTrack, hasReadyStories, isWordTrack, toArabicNumeral, wordTracks } from "@/data/days";
import {
  getActivePledge,
  getTodayRead,
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
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { ease, duration: 0.55 } },
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
  const hasDoneToday = !!todayRead && !devUnlimited;

  const readyTracks = wordTracks.filter(
    (track) => isWordTrack(track) && hasReadyStories(track, devMode)
  );
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

  function handlePledgeOutcome(outcome: "done" | "tried" | "forgot" | "no_situation") {
    if (!activePledge) return;
    updatePledgeStatus(activePledge.trackId, activePledge.storyId, outcome);
    setUserData(getUserData());
  }

  return (
    <main className="flex flex-col min-h-screen pb-24">
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease }}
        className="px-6 pt-12 pb-4 flex items-center justify-between"
      >
        <span className="text-[12px] font-bold tracking-[0.25em] text-kanah-accent-muted">
          كَنْه
        </span>
        <span className="text-[11px] text-kanah-locked">مكتبة كلمات حيّة</span>
      </motion.header>

      {/* ── DONE TODAY ── */}
      {hasDoneToday && todayTrack && todayStory ? (
        <section className="px-6 pt-4">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="bg-kanah-card border border-kanah-border rounded-[28px] p-6 shadow-sm"
          >
            <motion.p
              variants={item}
              className="text-[11px] font-semibold text-kanah-completed tracking-widest uppercase mb-3"
            >
              ✓ معنى اليوم اكتمل
            </motion.p>
            <motion.h1
              variants={item}
              className="text-[26px] font-extrabold text-kanah-text leading-[1.5] mb-1"
            >
              {todayTrack.word}
            </motion.h1>
            <motion.p
              variants={item}
              className="text-[16px] font-semibold text-kanah-accent mb-4"
            >
              {todayStory.title}
            </motion.p>

            {todayReflection && (
              <motion.div
                variants={item}
                className="bg-kanah-accent-subtle border border-kanah-border rounded-2xl p-4 mb-5"
              >
                <p className="text-[11px] font-semibold text-kanah-accent-muted tracking-widest uppercase mb-2">
                  الجملة التي بقيت فيك
                </p>
                <p className="text-[16px] leading-[1.9] text-kanah-text">
                  {todayReflection.selectedLine}
                </p>
              </motion.div>
            )}

            {activePledge && activePledgeTrack && activePledgeStory && (
              <motion.div variants={item}>
                <p className="text-[11px] font-semibold text-kanah-accent-muted tracking-widest uppercase mb-2">
                  هل اختبرت تعهدك اليوم؟
                </p>
                <p className="text-[15px] text-kanah-text leading-[2] mb-4">
                  {activePledge.pledgeText}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handlePledgeOutcome("done")}
                    className="rounded-2xl bg-kanah-accent text-white px-4 py-3 text-[14px] font-semibold active:scale-[0.98]"
                  >
                    نعم، طبّقته
                  </button>
                  <button
                    onClick={() => handlePledgeOutcome("tried")}
                    className="rounded-2xl border border-kanah-border bg-kanah-surface px-4 py-3 text-[14px] font-semibold text-kanah-text active:scale-[0.98]"
                  >
                    حاولت
                  </button>
                  <button
                    onClick={() => handlePledgeOutcome("forgot")}
                    className="rounded-2xl border border-kanah-border bg-kanah-surface px-4 py-3 text-[14px] font-semibold text-kanah-text active:scale-[0.98]"
                  >
                    لم أنتبه
                  </button>
                  <button
                    onClick={() => handlePledgeOutcome("no_situation")}
                    className="rounded-2xl border border-kanah-border bg-kanah-surface px-4 py-3 text-[14px] font-semibold text-kanah-text active:scale-[0.98]"
                  >
                    لم أواجه موقفاً
                  </button>
                </div>
              </motion.div>
            )}

            <motion.p variants={item} className="text-[13px] text-kanah-locked mt-5 text-center">
              عُد غداً لتعيش معنى جديداً
            </motion.p>
          </motion.div>
        </section>
      ) : (
        /* ── CHOOSE TODAY ── */
        <section className="px-6 pt-4">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="bg-kanah-card border border-kanah-border rounded-[28px] p-6 shadow-sm mb-6"
          >
            <motion.p
              variants={item}
              className="text-[11px] font-semibold text-kanah-accent-muted tracking-widest uppercase mb-3"
            >
              اليوم
            </motion.p>
            <motion.h1
              variants={item}
              className="text-[28px] font-extrabold text-kanah-text leading-[1.5] mb-2"
            >
              اختر معنى اليوم
            </motion.h1>
            <motion.p
              variants={item}
              className="text-[15px] text-kanah-muted leading-[2] mb-6"
            >
              قصة واحدة تكفي. اختر الكلمة التي تريد أن تعيشها اليوم.
            </motion.p>

            <motion.div variants={item} className="flex flex-col gap-3">
              {readyTracks.map((track) => {
                if (!isWordTrack(track)) return null;
                const completed = userData.completedStoriesByTrack[track.id]?.length ?? 0;
                return (
                  <Link
                    key={track.id}
                    href={`/tracks/${track.id}`}
                    className="flex items-center justify-between rounded-2xl border border-kanah-border bg-kanah-surface px-5 py-4 active:scale-[0.98]"
                  >
                    <div>
                      <p className="text-[18px] font-bold text-kanah-accent">{track.word}</p>
                      <p className="text-[12px] text-kanah-muted">{track.subtitle}</p>
                    </div>
                    <span className="text-[11px] text-kanah-locked">
                      {toArabicNumeral(completed)}/{toArabicNumeral(track.totalStories)}
                    </span>
                  </Link>
                );
              })}
            </motion.div>
          </motion.div>
        </section>
      )}

      {/* Library shortcut — always visible */}
      <section className="px-6 pt-2">
        <Link
          href="/library"
          className="block rounded-[24px] border border-kanah-border bg-kanah-surface px-5 py-5 transition-colors hover:bg-kanah-card"
        >
          <p className="text-[12px] font-semibold text-kanah-accent-muted tracking-widest uppercase mb-2">
            المكتبة
          </p>
          <p className="text-[22px] font-bold text-kanah-text mb-2">
            استكشف مكتبة الكلمات
          </p>
          <p className="text-[14px] text-kanah-muted leading-[1.9]">
            اختر كلمة، وادخل في مسار قصصي يجعل المعنى يعيش معك.
          </p>
        </Link>
      </section>

      <section className="px-6 pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-kanah-card rounded-2xl p-5 border border-kanah-border">
            <span className="text-[34px] font-extrabold text-kanah-accent leading-none block">
              {toArabicNumeral(
                Object.values(userData.completedStoriesByTrack).reduce((s, a) => s + a.length, 0)
              )}
            </span>
            <span className="text-[12px] text-kanah-muted mt-2 block leading-snug">
              قصة أتممتها
            </span>
          </div>
          <div className="bg-kanah-card rounded-2xl p-5 border border-kanah-border">
            <span className="text-[34px] font-extrabold text-kanah-accent leading-none block">
              {toArabicNumeral(Object.keys(userData.dailyReads ?? {}).length)}
            </span>
            <span className="text-[12px] text-kanah-muted mt-2 block leading-snug">
              يوم عشت فيه معنى
            </span>
          </div>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}
