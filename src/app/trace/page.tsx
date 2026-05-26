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

  const triedCaption =
    triedCount === 0
      ? "حتى قبل النتيجة، يكفي أنك بدأت تلاحظ اللحظة."
      : triedCount === 1
      ? "بدأت تلاحظ لحظة الغضب قبل أن تقودك."
      : "محاولاتك المتكررة تعني أن المعنى صار حاضراً في وعيك.";

  return (
    <main className="flex flex-col min-h-screen pb-24">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease, duration: 0.45 }}
        className="px-6 pt-12 pb-8"
      >
        <p className="text-[11px] font-semibold text-kanah-accent-muted tracking-widest uppercase mb-1">
          أثري
        </p>
        <h1 className="text-[22px] font-bold text-kanah-text leading-tight">
          الجمل التي بقيت فيك وما أخذته معك من المسارات
        </h1>
      </motion.header>

      {todayRead && todayTrack && todayStory && (
        <div className="px-6 mb-8">
          <div className="bg-kanah-card border border-kanah-border rounded-2xl p-5">
            <p className="text-[11px] font-semibold text-kanah-completed tracking-widest uppercase mb-2">
              ✓ معنى اليوم
            </p>
            <p className="text-[19px] font-bold text-kanah-accent mb-1">{todayTrack.word}</p>
            <p className="text-[14px] text-kanah-text">{todayStory.title}</p>
          </div>
        </div>
      )}

      <motion.div
        variants={gridContainer}
        initial="hidden"
        animate="show"
        className="px-6 grid grid-cols-2 gap-4 mb-10"
      >
        <motion.div variants={gridCard} className="bg-kanah-card rounded-2xl p-5 border border-kanah-border">
          <span className="text-[38px] font-extrabold text-kanah-accent leading-none block">
            {toArabicNumeral(totalCompleted)}
          </span>
          <span className="text-[12px] text-kanah-muted mt-2 block leading-snug">
            قصة أتممتها
          </span>
          <p className="text-[12px] text-kanah-muted leading-[1.8] mt-3">
            {completedCaption}
          </p>
        </motion.div>
        <motion.div variants={gridCard} className="bg-kanah-card rounded-2xl p-5 border border-kanah-border">
          <span className="text-[38px] font-extrabold text-kanah-accent leading-none block">
            {toArabicNumeral(totalDays)}
          </span>
          <span className="text-[12px] text-kanah-muted mt-2 block leading-snug">
            يوم عشت فيه معنى
          </span>
        </motion.div>
        <motion.div variants={gridCard} className="bg-kanah-card rounded-2xl p-5 border border-kanah-border">
          <span className="text-[38px] font-extrabold text-kanah-accent leading-none block">
            {toArabicNumeral(totalCommitments)}
          </span>
          <span className="text-[12px] text-kanah-muted mt-2 block leading-snug">
            تعهداً أخذته
          </span>
          <p className="text-[12px] text-kanah-muted leading-[1.8] mt-3">
            {pledgeCaption}
          </p>
        </motion.div>
        <motion.div variants={gridCard} className="bg-kanah-card rounded-2xl p-5 border border-kanah-border">
          <span className="text-[38px] font-extrabold text-kanah-accent leading-none block">
            {toArabicNumeral(doneCount)}
          </span>
          <span className="text-[12px] text-kanah-muted mt-2 block leading-snug">
            مرة طبّقته
          </span>
          <p className="text-[12px] text-kanah-muted leading-[1.8] mt-3">
            {doneCaption}
          </p>
        </motion.div>
      </motion.div>

      <div className="px-6 mb-10">
        <h2 className="text-[10px] font-semibold text-kanah-locked tracking-widest uppercase mb-4">
          تقدّمك في الكلمات
        </h2>
        <motion.div
          variants={listContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-col gap-3"
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
                className="bg-kanah-card rounded-2xl border border-kanah-border px-5 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[17px] font-bold text-kanah-text">
                      {track.word}
                    </p>
                    <p className="text-[12px] text-kanah-muted mt-1">
                      {track.subtitle}
                    </p>
                  </div>
                  <span className="text-[13px] font-semibold text-kanah-accent">
                    {toArabicNumeral(progress)} من{" "}
                    {toArabicNumeral(total)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {enrichedReflections.length > 0 ? (
        <div className="px-6 flex flex-col">
          <h2 className="text-[10px] font-semibold text-kanah-locked tracking-widest uppercase mb-4">
            الجمل التي بقيت فيك
          </h2>
          <motion.div
            variants={listContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-col divide-y divide-kanah-border"
          >
            {enrichedReflections.map((reflection) => (
              <motion.div key={`${reflection.trackId}-${reflection.storyId}`} variants={listItem} className="py-5">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-[11px] font-semibold text-kanah-accent bg-kanah-accent-subtle px-2.5 py-1 rounded-full">
                    {reflection.track!.word}
                  </span>
                  <span className="text-[11px] text-kanah-text">
                    القصة {toArabicNumeral(reflection.story!.storyNumber)}:
                    {" "}{reflection.story!.title}
                  </span>
                </div>
                <p className="text-[11px] text-kanah-locked mb-3">
                  {formatArabicDate(reflection.createdAt)}
                </p>
                <blockquote className="text-[18px] leading-[1.9] text-kanah-text font-medium">
                  “{reflection.selectedLine}”
                </blockquote>
              </motion.div>
            ))}
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-10 py-16 gap-5">
          <span className="text-[30px] text-kanah-border">✦</span>
          <p className="text-kanah-muted text-[15px] leading-[1.9]">
            لم تحفظ جملة بعد.
            <br />
            أكمل قصة واحدة واختر جملة بقيت فيك وستظهر هنا.
          </p>
        </div>
      )}

      <div className="px-6 mt-10">
        <h2 className="text-[10px] font-semibold text-kanah-locked tracking-widest uppercase mb-4">
          آخر تعهد
        </h2>
        {latestPledge && latestPledgeTrack && latestPledgeStory ? (
          <div className="bg-kanah-card rounded-2xl border border-kanah-border p-5">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[11px] font-semibold text-kanah-accent bg-kanah-accent-subtle px-2.5 py-1 rounded-full">
                {latestPledgeTrack.word}
              </span>
              <span className="text-[11px] text-kanah-text">
                القصة {toArabicNumeral(latestPledgeStory.storyNumber)}: {latestPledgeStory.title}
              </span>
            </div>
            <p className="text-[16px] leading-[1.9] text-kanah-text mb-3">
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
          <div className="bg-kanah-card rounded-2xl border border-kanah-border p-5">
            <p className="text-[15px] text-kanah-muted leading-[1.9]">
              لم تأخذ تعهداً بعد. بعد إكمال قصة وحفظ الجملة التي بقيت فيك، سيظهر تعهدك هنا.
            </p>
          </div>
        )}
      </div>

      <div className="px-6 mt-10">
        <h2 className="text-[10px] font-semibold text-kanah-locked tracking-widest uppercase mb-4">
          نتائج التعهدات
        </h2>
        <div className="bg-kanah-card rounded-2xl border border-kanah-border p-5">
          <p className="text-[15px] text-kanah-muted leading-[1.9]">
            هذا القسم سيتوسّع لاحقاً ليربط كل تعهد بنتيجته عبر الزمن، حتى ترى كيف انتقل المعنى من القراءة إلى السلوك.
          </p>
        </div>
      </div>

      {devMode && (
        <div className="px-6 mt-10">
          <button
            onClick={handleReset}
            className="w-full py-3 rounded-xl text-[13px] font-medium text-red-500 border border-red-200 bg-red-50 transition-colors active:bg-red-100"
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
