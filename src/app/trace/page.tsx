"use client";

import { useEffect, useState } from "react";
import {
  getTrack,
  getTrackProgress,
  getNamesTrackProgress,
  getStory,
  isNamesTrack,
  isWordTrack,
  toArabicNumeral,
  wordTracks,
} from "@/data/days";
import {
  formatArabicDate,
  getTodayRead,
  getUserData,
  isDevMode,
  resetUserData,
  UserData,
} from "@/lib/storage";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";

const ease = [0.16, 1, 0.3, 1] as const;

const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const gridCard = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { ease, duration: 0.45 } },
};
const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const listItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { ease, duration: 0.4 } },
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2.5 text-[11px] font-semibold text-kanah-accent-muted tracking-[0.18em] mb-4">
      <span className="w-5 h-px bg-kanah-accent-muted/60" />
      {children}
    </h2>
  );
}

export default function TracePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    setUserData(getUserData());
    setDevMode(isDevMode());
  }, []);

  if (!userData) return null;

  const totalCompleted = Object.values(userData.completedStoriesByTrack).reduce(
    (sum, stories) => sum + stories.length,
    0
  );
  const totalDays = Object.keys(userData.dailyReads ?? {}).length;
  const todayRead = getTodayRead(userData);
  const todayTrack = todayRead ? getTrack(todayRead.trackId) : null;
  const todayStory =
    todayRead && todayRead.itemType !== "name" && todayRead.storyId != null
      ? getStory(todayRead.trackId, todayRead.storyId)
      : null;
  const totalCommitments = userData.pledges.length;
  const doneCount = userData.pledges.filter((pledge) => pledge.status === "done").length;
  const triedCount = userData.pledges.filter((pledge) => pledge.status === "tried").length;
  const latestPledge =
    userData.pledges.length > 0 ? userData.pledges[userData.pledges.length - 1] : null;
  const latestPledgeTrack = latestPledge ? getTrack(latestPledge.trackId) : null;
  const latestPledgeStory = latestPledge
    ? getStory(latestPledge.trackId, latestPledge.storyId)
    : null;

  const enrichedReflections = userData.reflections
    .map((reflection) => ({
      ...reflection,
      track: getTrack(reflection.trackId),
      story: getStory(reflection.trackId, reflection.storyId),
    }))
    .filter((reflection) => reflection.track && reflection.story)
    .reverse();

  function handleReset() {
    resetUserData();
    setUserData(getUserData());
  }

  const completedCaption =
    totalCompleted === 0
      ? "كل قصة تكملها تترك أثراً صغيراً يتراكم بهدوء."
      : totalCompleted === 1
      ? "قصة واحدة بدأت تترك أثرها في طريقة انتباهك لنفسك."
      : `مع كل قصة تكملها، تصبح ملاحظتك لنفسك أوضح وأهدأ.`;

  const pledgeCaption =
    totalCommitments === 0
      ? "حين تأخذ أول تعهد، يبدأ المعنى بالخروج من القراءة إلى السلوك."
      : totalCommitments === 1
      ? "تعهد واحد يكفي ليبدأ المعنى بالتحرك في يومك."
      : "تعهداتك اليومية تصنع جسراً صغيراً بين الفهم والعمل.";

  const doneCaption =
    doneCount === 0
      ? "لم يثبت بعد أثر مكتمل، لكنه بدأ يتكوّن بالمحاولة والانتباه."
      : doneCount === 1
      ? "مرة واحدة انتظرت قبل أن ترد."
      : `${toArabicNumeral(doneCount)} مرات استطعت أن تحوّل المعنى إلى فعل.`;

  const stats = [
    { value: totalCompleted, label: "قصة أتممتها", caption: completedCaption },
    { value: totalDays, label: "يوم عشت فيه معنى", caption: null },
    { value: totalCommitments, label: "تعهداً أخذته", caption: pledgeCaption },
    { value: doneCount, label: "مرة طبّقته", caption: doneCaption },
  ];

  return (
    <main className="flex flex-col min-h-screen pb-32 relative">
      <PageHeader title="أثري" tagline="معانٍ تحوّلت إلى فعل" />

      {todayRead && todayTrack && todayStory && (
        <div className="px-6 mb-8 relative z-10">
          <div className="rounded-[26px] border border-kanah-completed/25 bg-kanah-completed-subtle p-6">
            <p className="text-[11px] font-semibold text-kanah-completed tracking-[0.15em] mb-3">
              ✓ معنى اليوم
            </p>
            <p className="font-display text-[28px] text-kanah-text leading-tight mb-1">
              {todayTrack.word}
            </p>
            <p className="text-[13.5px] text-kanah-muted">{todayStory.title}</p>
          </div>
        </div>
      )}

      <motion.div
        variants={gridContainer}
        initial="hidden"
        animate="show"
        className="px-6 grid grid-cols-2 gap-3 mb-12 relative z-10"
      >
        {stats.map(({ value, label, caption }) => (
          <motion.div
            key={label}
            variants={gridCard}
            className="rounded-[26px] bg-kanah-card border border-kanah-border p-5"
          >
            <span className="font-display text-[46px] text-kanah-accent leading-none block tabular-nums">
              {toArabicNumeral(value)}
            </span>
            <span className="text-[12px] text-kanah-muted mt-2.5 block leading-snug">
              {label}
            </span>
            {caption && (
              <p className="text-[11.5px] text-kanah-locked leading-[1.8] mt-3">
                {caption}
              </p>
            )}
          </motion.div>
        ))}
      </motion.div>

      <div className="px-6 mb-12 relative z-10">
        <SectionTitle>تقدّمك في الكلمات</SectionTitle>
        <motion.div
          variants={listContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="rounded-[26px] border border-kanah-border bg-kanah-card divide-y divide-kanah-border overflow-hidden"
        >
          {wordTracks.map((track) => {
            const progress = isNamesTrack(track)
              ? getNamesTrackProgress(track.id, userData.completedNamesByTrack)
              : getTrackProgress(track.id, userData.completedStoriesByTrack);

            const total = isNamesTrack(track)
              ? track.totalNames
              : isWordTrack(track)
              ? track.totalStories
              : 0;

            return (
              <motion.div
                key={track.id}
                variants={listItem}
                className="px-6 py-4"
              >
                <div className="flex items-center justify-between gap-4 mb-2.5">
                  <div>
                    <p className="text-[15.5px] font-bold text-kanah-text">
                      {track.word}
                    </p>
                    <p className="text-[11.5px] text-kanah-muted mt-0.5">
                      {track.subtitle}
                    </p>
                  </div>
                  <span className="text-[12.5px] font-semibold text-kanah-accent tabular-nums shrink-0">
                    {toArabicNumeral(progress)} من {toArabicNumeral(total)}
                  </span>
                </div>
                <div className="h-1 bg-kanah-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-kanah-accent rounded-full transition-all duration-700"
                    style={{ width: `${total > 0 ? (progress / total) * 100 : 0}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {enrichedReflections.length > 0 ? (
        <div className="px-6 flex flex-col relative z-10">
          <SectionTitle>الجمل التي بقيت فيك</SectionTitle>
          <motion.div
            variants={listContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-col gap-4"
          >
            {enrichedReflections.map((reflection) => (
              <motion.div
                key={`${reflection.trackId}-${reflection.storyId}`}
                variants={listItem}
                className="rounded-[26px] border border-kanah-border bg-kanah-card p-6 relative overflow-hidden"
              >
                <span
                  aria-hidden
                  className="font-display absolute top-3 start-5 text-[64px] leading-none text-kanah-accent-subtle select-none"
                >
                  ”
                </span>
                <blockquote className="font-display text-[20px] leading-[2] text-kanah-text relative mb-5 pt-4">
                  {reflection.selectedLine}
                </blockquote>
                <div className="flex flex-wrap items-center gap-2 relative">
                  <span className="text-[11px] font-semibold text-kanah-accent bg-kanah-accent-subtle px-3 py-1 rounded-full">
                    {reflection.track!.word}
                  </span>
                  <span className="text-[11px] text-kanah-muted">
                    {reflection.story!.title}
                  </span>
                  <span className="text-[10.5px] text-kanah-locked ms-auto">
                    {formatArabicDate(reflection.createdAt)}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-10 py-16 gap-5 relative z-10">
          <span className="font-display text-[36px] text-kanah-accent-muted">✦</span>
          <p className="text-kanah-muted text-[15px] leading-[1.9]">
            لم تحفظ جملة بعد.
            <br />
            أكمل قصة واحدة واختر جملة بقيت فيك وستظهر هنا.
          </p>
        </div>
      )}

      <div className="px-6 mt-12 relative z-10">
        <SectionTitle>آخر تعهد</SectionTitle>
        {latestPledge && latestPledgeTrack && latestPledgeStory ? (
          <div className="rounded-[26px] border border-kanah-accent/20 bg-kanah-accent-subtle p-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-[11px] font-semibold text-kanah-accent bg-kanah-card px-3 py-1 rounded-full">
                {latestPledgeTrack.word}
              </span>
              <span className="text-[11px] text-kanah-muted">
                {latestPledgeStory.title}
              </span>
            </div>
            <p className="text-[15.5px] leading-[2] text-kanah-text mb-3">
              {latestPledge.pledgeText}
            </p>
            <p className="text-[12px] text-kanah-muted">
              الحالة الحالية:{" "}
              {latestPledge.status === "active"
                ? "بانتظار المتابعة"
                : latestPledge.status === "done"
                ? "طبّقته"
                : latestPledge.status === "tried"
                ? "حاولت"
                : latestPledge.status === "forgot"
                ? "نسيت"
                : "لم أواجه موقفاً"}
            </p>
          </div>
        ) : (
          <div className="rounded-[26px] border border-kanah-border bg-kanah-card p-6">
            <p className="text-[14px] text-kanah-muted leading-[1.9]">
              لم تأخذ تعهداً بعد. بعد إكمال قصة وحفظ الجملة التي بقيت فيك، سيظهر تعهدك هنا.
            </p>
          </div>
        )}
      </div>

      {devMode && (
        <div className="px-6 mt-12 relative z-10">
          <button
            onClick={handleReset}
            className="w-full py-3 rounded-full text-[13px] font-medium text-red-400 border border-red-400/30 bg-red-400/5 transition-colors active:bg-red-400/10"
          >
            مسح بيانات الاختبار
          </button>
          <p className="text-center text-[10px] text-kanah-locked mt-2">
            يظهر هذا الزر في وضع التطوير فقط
          </p>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
