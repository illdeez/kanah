"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { ease, duration: 0.45 } },
};

export interface CompletionFlowProps {
  badgeText: string;
  word: string;
  itemTitle: string;
  selectedLines: string[];
  pledgeText: string;
  pledgeHint: string;
  onSaveReflection: (line: string) => void;
  onSavePledge: () => void;
  onSkipLine: () => void;
  onSkipPledge: () => void;
  savedRedirectDelay?: number;
}

export default function CompletionFlow({
  badgeText,
  word,
  itemTitle,
  selectedLines,
  pledgeText,
  pledgeHint,
  onSaveReflection,
  onSavePledge,
  onSkipLine,
  onSkipPledge,
}: CompletionFlowProps) {
  const [selectedLine, setSelectedLine] = useState("");
  const [step, setStep] = useState<"line" | "pledge">("line");
  const [saved, setSaved] = useState(false);

  function handleSaveLine() {
    if (selectedLines.length > 0) {
      if (!selectedLine) return;
      onSaveReflection(selectedLine);
    }
    setStep("pledge");
  }

  function handleSavePledge() {
    setSaved(true);
    onSavePledge();
  }

  function handleSkip() {
    if (step === "line") {
      onSkipLine();
      return;
    }
    setSaved(true);
    onSkipPledge();
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6 gap-6 relative z-10">
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 18, stiffness: 280, delay: 0.1 }}
          className="font-display text-[48px] text-kanah-accent block leading-none"
        >
          ✦
        </motion.span>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease, duration: 0.45, delay: 0.25 }}
        >
          <p className="font-display text-[26px] font-bold text-kanah-text mb-3">
            حُفظت
          </p>
          <p className="text-[13.5px] text-kanah-muted">
            ستجد الجملة التي بقيت فيك وتعهدك في صفحة أثري
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen px-6 pt-14 pb-8 relative z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease, duration: 0.5 }}
        className="pt-8 pb-10"
      >
        <span className="inline-flex items-center gap-2 text-[11.5px] font-semibold text-kanah-completed bg-kanah-completed-subtle px-3.5 py-1.5 rounded-full mb-9">
          <Check size={12} strokeWidth={3} />
          {badgeText}
        </span>

        <AnimatePresence mode="wait">
          {step === "line" ? (
            <motion.div
              key="line-header"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ ease, duration: 0.35 }}
            >
              <p className="font-display text-[30px] font-bold text-kanah-text leading-[1.4] mb-3">
                اختر الجملة التي بقيت فيك
              </p>
              <p className="text-[14px] text-kanah-muted leading-[1.9]">
                واحفظها في أثرك لتعود إليها لاحقاً.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="pledge-header"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ ease, duration: 0.35 }}
            >
              <p className="font-display text-[30px] font-bold text-kanah-text leading-[1.4] mb-3">
                تعهد اليوم
              </p>
              <p className="text-[14px] text-kanah-muted leading-[1.9]">
                {pledgeHint}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-3">
        <AnimatePresence mode="wait">
          {step === "line" ? (
            <motion.div
              key="line-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ ease, duration: 0.35 }}
              className="flex flex-col gap-3"
            >
              <p className="text-[12px] text-kanah-locked leading-[1.8]">
                سيُحفَظ اختيارك تحت {word} · {itemTitle}
              </p>
              {selectedLines.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col gap-3"
                >
                  {selectedLines.map((line) => {
                    const active = selectedLine === line;
                    return (
                      <motion.button
                        key={line}
                        variants={itemVariants}
                        type="button"
                        onClick={() => setSelectedLine(line)}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-right rounded-[22px] border p-5 transition-colors ${
                          active
                            ? "border-kanah-accent bg-kanah-accent-subtle"
                            : "border-kanah-border bg-kanah-card"
                        }`}
                      >
                        <span className="flex items-start gap-3">
                          <span
                            className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                              active
                                ? "border-kanah-accent bg-kanah-accent text-kanah-on-accent"
                                : "border-kanah-border bg-kanah-surface"
                            }`}
                          >
                            {active && <Check size={11} strokeWidth={3} />}
                          </span>
                          <span className="font-display text-[18px] leading-[1.95] text-kanah-text">
                            {line}
                          </span>
                        </span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              ) : (
                <div className="rounded-[22px] border border-kanah-border bg-kanah-card p-6 text-center text-kanah-muted text-[14px]">
                  لا توجد جمل مختارة بعد
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="pledge-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ ease, duration: 0.4 }}
              className="flex flex-col gap-3"
            >
              <p className="text-[12px] text-kanah-locked leading-[1.8]">
                سيُحفَظ هذا التعهد كتذكير بسلوك اليوم.
              </p>
              <div className="rounded-[28px] border border-kanah-accent/20 bg-kanah-accent-subtle p-7">
                <p className="font-display text-[26px] text-kanah-accent mb-4 leading-none">
                  {word}
                </p>
                <p className="text-[17px] leading-[2.05] text-kanah-text">
                  {pledgeText}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-6">
        <AnimatePresence mode="wait">
          {step === "line" ? (
            <motion.button
              key="save-line"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ ease, duration: 0.3 }}
              onClick={handleSaveLine}
              disabled={!selectedLine && selectedLines.length > 0}
              whileTap={selectedLine || selectedLines.length === 0 ? { scale: 0.97 } : {}}
              className="w-full bg-kanah-accent text-kanah-on-accent py-4 rounded-full text-[16px] font-bold shadow-accent disabled:opacity-40 disabled:cursor-default"
            >
              {selectedLines.length > 0 ? "احفظها في أثري" : "التالي"}
            </motion.button>
          ) : (
            <motion.button
              key="save-pledge"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ ease, duration: 0.3 }}
              onClick={handleSavePledge}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-kanah-accent text-kanah-on-accent py-4 rounded-full text-[16px] font-bold shadow-accent"
            >
              أتعهد بهذا اليوم
            </motion.button>
          )}
        </AnimatePresence>
        <button
          onClick={handleSkip}
          className="w-full py-3 text-kanah-locked text-[13px] transition-colors hover:text-kanah-muted"
        >
          {step === "line" ? "تخطي الآن" : "لاحقاً"}
        </button>
      </div>
    </main>
  );
}
