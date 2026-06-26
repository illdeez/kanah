# كُنه — Roadmap + Checklist

> Single source of truth for the retention/daily-loop redesign.
> Co-developed by Abdulrahman + Claude + ChatGPT (كُنه project). Follow this map before editing anything.
> The Arabic task lines are the **agreed spec**. The `↳` lines are Claude's code annotations (where in the actual codebase each task lives). Update the checkboxes as we ship.

## How to use
- Work top-to-bottom **within** a phase (tasks are ordered by dependency).
- Don't start a `Phase N` task until its prerequisites in earlier phases are done.
- A task is "done" only when its **معيار القبول (acceptance)** is verified in the running app.
- If a task is `blocked-by` an open question (see bottom), don't build it until the question is answered.

## Status legend
- `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked

## Code map (current codebase)
| Area | File | Notes |
|---|---|---|
| Day boundary / storage / pledges / events | `src/lib/storage.ts` | `getTodayString()` currently uses `toISOString()` = **UTC bug**. `UserData`, `Pledge`-like `pledges[]`, `reflections[]`, `dailyReads`, `completeStory/Name/NameStory`. New `event log` goes here. |
| Home ("اليوم") | `src/app/page.tsx` | Today's story, pledge follow-up UI, stats block (vanity numbers), review gate, resurfaced sentence. `resolveTodayHomeState()` to be added. |
| Completion (sentence + pledge) | `src/components/CompletionFlow.tsx` | Keep phrase + pledge here (NOT as Home states). |
| Reader (story) | `src/components/StoryReader.tsx` | `sessionDayKey` captured on open. |
| "أثري" (trace) | `src/app/trace/page.tsx` | De-vanity stats, reorder to memory-first. |
| Content / tracks / names | `src/data/days.ts` | ختمة المعنى, journey metadata, اسم اليوم / اسم يناسب حالك. |
| AI chat | `src/app/chat/page.tsx`, `src/app/api/an-token/route.ts` | Narrow scope to "اسأل عن الاسم". |

---

## Phase 0 — إصلاحات تأسيسية

- [x] [P0-01] استبدال `getTodayString()` بمفهوم `appDayKey` يبدأ ٤:٠٠ صباحاً محلياً / لماذا: منع انقلاب اليوم قبل النوم أو بسبب UTC / القبول: القراءة بين 00:00 و03:59 تُحسب لليوم السابق، وبعد 04:00 تُحسب لليوم الجديد.
  - ↳ DONE (revised after ChatGPT review): `getAppDayKey()` uses **local-hour comparison** (`if getHours() < 4 → setDate(-1)`), not ms-subtraction — DST-safe. Added `addAppDays()` for P0-04 dueDate. Verified across Dubai/NY + DST fall-back night (9 cases pass); tsc + build clean.
- [x] [P0-02] تثبيت `sessionDayKey` عند فتح القصة واستخدامه عند الإكمال / لماذا: منع انقسام جلسة قراءة بدأت قبل ٤ص وانتهت بعدها / القبول: قصة بدأت 03:55 وانتهت 04:05 تُسجَّل على نفس يوم بدايتها.
  - ↳ DONE (extended after ChatGPT review): `dayKey` also flows to `saveReflection`/`savePledge` via `getRitualDayKey()` on all 3 complete pages — so a session crossing 04:00 keeps story+sentence+pledge on the **same** day. 2nd review round: `createdAt` is now the real ISO timestamp and `dayKey` a **separate field** on `Reflection`/`Pledge` (migration backfills it); `formatArabicDate` slices to 10 chars; trace shows `dayKey`; `getRitualDayKey` dev-warns instead of silent fallback. `addAppDays(ritualDayKey, 1)` ready for pledge `dueDate` in P0-04.
- [x] [P0-03] إضافة توافق مؤقت مع مفاتيح UTC القديمة عند فحص إكمال اليوم / لماذا: منع كسر تقدم المستخدمين الحاليين بعد تغيير نظام التاريخ / القبول: المستخدم الذي أتم قصة اليوم بالنظام القديم لا تُفتح له قصة مكررة بعد التحديث.
  - ↳ DONE (revised after ChatGPT review): `getTodayReadMap()` now **reclassifies by effective app-day** (record's own `dayKey`, else `getAppDayKey(completedAt)`) across today's bucket + adjacent legacy UTC buckets — not a fragile string-key merge. Added `dayKey` field to `DailyRead`. Writes go to the new key only.
- [x] [P0-04] تعريف نموذج تعهد موحّد يدعم `pending`, `reviewed`, `soft_closed` / لماذا: منع تراكم التعهدات كديون مفتوحة للأبد / القبول: كل تعهد يمكن مراجعته أو طيّه دون حذفه.
  - ↳ DONE: `PledgeStatus = pending|reviewed|soft_closed` + `PledgeReviewAnswer`; `Pledge` gains `dueDate=addAppDays(dayKey,1)` + `review{dayKey,answer}`. New fns: `reviewPledge`, `softClosePledge`, `getReviewCandidate` (single, newest-due, active-track-first, ≤6d), `daysBetweenKeys`. Migration maps legacy active→pending, done/tried/forgot/no_situation→reviewed+answer. Consumers updated (home `handlePledgeOutcome`→`reviewPledge`; trace status labels). tsc + build clean.
- [x] [P0-05] بناء `resolveTodayHomeState()` كدالة مركزية بأربع حالات رئيسية / لماذا: منع تناثر شروط الصفحة الرئيسية داخل المكونات / القبول: الصفحة الرئيسية تُشتق من resolver واحد فقط.
  - ↳ DONE: `src/lib/homeState.ts` — pure `resolveTodayHomeState({data,appDayKey,devMode,devUnlimited,flags})` → 4 states (NoActiveTrack/ReviewGate/StoryAvailable/CompletedToday) per ChatGPT's contract + Ref types. Gate behind `enableReviewGate` flag (default false). storyId kept as `number` (codebase deviation from sketch). Not yet wired to page.tsx (that's P0-06). tsc + build clean.
- [ ] [P0-06] حصر حالات Home في `NO_ACTIVE_TRACK`, `PRE_STORY_REVIEW`, `STORY_AVAILABLE`, `COMPLETED_TODAY` / لماذا: إبقاء الجملة والتعهد داخل `CompletionFlow` لا داخل Home / القبول: لا توجد حالات Home وسيطة مثل `phrase_selected` أو `completed_story_only`.
  - ↳ phrase/pledge stay in `src/components/CompletionFlow.tsx`.
- [ ] [P0-07] اشتقاق `needsEffectCompletion` من البيانات الحالية لا من state جديد / لماذا: تنبيه من قرأ القصة ولم يحفظ أثراً دون تعقيد التخزين / القبول: إذا وُجد إكمال اليوم بلا جملة أو بلا تعهد يظهر CTA "أكمل الأثر".
  - ↳ derive in `resolveTodayHomeState()` from `reflections`/`pledges` vs `dailyReads`.
- [ ] [P0-08] إضافة event log محلي محدود في `localStorage` / لماذا: قياس التجربة دون سيرفر أو طرف ثالث / القبول: تُسجَّل أحداث أساسية مثل `home_viewed`, `review_seen`, `story_opened`, `story_completed`, `pledge_created`.
  - ↳ `src/lib/storage.ts` (new `logEvent()` + ring buffer key).
- [ ] [P0-09] منع تسجيل نصوص التعهدات والجمل داخل event log / لماذا: حماية خصوصية الأثر الشخصي / القبول: الأحداث تحتوي IDs وأنواع إجابات فقط، لا نصوص شخصية.
- [ ] [P0-10] إضافة صفحة أو وضع debug محلي للـinsights / لماذا: قراءة المقاييس أثناء التطوير والاختبار دون analytics خارجية / القبول: يمكن عرض معدلات فتح القصة، إكمالها، ومزيج إجابات التعهد من الجهاز نفسه.
  - ↳ reuse existing dev-mode pattern (`isDevMode()` in `src/lib/storage.ts`).
- [ ] [P0-11] إضافة تصدير يدوي لسجل الأحداث المحلي / لماذا: تمكين اختبار beta مع احترام الخصوصية / القبول: المستخدم يستطيع تنزيل JSON/CSV للأحداث بإرادته.
- [ ] [P0-12] إضافة test harness صريح لمنطق التاريخ (`getAppDayKey`/`addAppDays`/إعادة التصنيف) / لماذا: `next build` لا يثبت صحة منطق الزمن (طلب ChatGPT) / القبول: تمر مصفوفة اختبارات Dubai/NY/DST آلياً. ملاحظة: لا يوجد test runner بعد — تم التحقق يدوياً (9 حالات) ريثما يُضاف.

## Phase 1 — حلقة الرجوع

- [ ] [P1-01] بناء اختيار تعهد مراجعة واحد فقط عبر `getReviewCandidate()` / لماذا: منع تحويل الصفحة الرئيسية إلى دفتر ديون / القبول: Home لا يعرض أكثر من تعهد واحد مهما كثرت التعهدات المعلقة.
  - ↳ `src/lib/storage.ts` helper, used by `resolveTodayHomeState()`.
- [ ] [P1-02] إعطاء أولوية لتعهد المسار النشط ثم أحدث تعهد مستحق / لماذا: جعل المراجعة مرتبطة بالسياق الأقرب للمستخدم / القبول: إذا وُجد تعهد مستحق في المسار النشط يظهر قبل تعهدات المسارات الأخرى.
- [ ] [P1-03] عرض بوابة خفيفة فقط لتعهد أمس الطازج / لماذا: إنشاء عتبة وعي دون جلد أو احتكاك دائم / القبول: تعهد عمره يوم واحد يظهر قبل القصة كقرار واحد مطلوب.
  - ↳ `PRE_STORY_REVIEW` branch in `src/app/page.tsx` (new ReviewGate component).
- [ ] [P1-04] جعل خيارات بوابة أمس رحيمة وتشمل "أبدأ اليوم فقط" / لماذا: منع الهروب بسبب الشعور بالذنب / القبول: يمكن تجاوز البوابة بقرار صريح دون وسم المستخدم بالفشل.
- [ ] [P1-05] تحويل التعهد المتأخر ٢–٦ أيام إلى بطاقة اختيارية لا تحجب القصة / لماذا: الذاكرة تضعف والمحاسبة المتأخرة تصبح أقل صدقاً / القبول: التعهد المتأخر يظهر فوق القصة أو بجانبها دون منع فتح القصة.
- [ ] [P1-06] إخفاء التعهدات الأقدم من ٦ أيام من Home / لماذا: استقبال العائد بعد غياب بالرجوع لا بالمحاسبة / القبول: لا يظهر في Home أي تعهد عمره ٧ أيام أو أكثر.
- [ ] [P1-07] طيّ التعهدات القديمة إلى `soft_closed` عند التنظيف أو عند اختيار المستخدم / لماذا: إغلاق الحلقات القديمة دون لوم / القبول: التعهد القديم لا يبقى مرشحاً للمراجعة في الصفحة الرئيسية.
- [ ] [P1-08] تسجيل أحداث `review_seen`, `review_answered`, `review_deferred`, `story_opened` / لماذا: معرفة هل البوابة تقتل فتح القصة أم لا / القبول: يمكن حساب `review_to_story_open_rate` محلياً.
- [ ] [P1-09] اعتماد مقاييس الحلقة لا النقرة الخام فقط / لماذا: معدل المراجعة وحده قابل للخداع / القبول: debug يعرض `review_to_story_open_rate`, `pledge_created_to_next_app_day_return_rate`, وتوزيع الإجابات.
- [ ] [P1-10] إزالة أو دفن أرقام الإنجاز من صدر صفحة "اليوم" / لماذا: تقليل vanity في تجربة روحانية / القبول: الصفحة الرئيسية لا تبدأ بعدّاد قصص أو أيام أو تعهدات.
  - ↳ `src/app/page.tsx` stats block (`totalCompleted` / `totalDays`).
- [ ] [P1-11] استبدال أرقام "اليوم" ببطاقات ذاكرة قلب / لماذا: ربط الرجوع بالأثر لا بالإنجاز / القبول: تظهر عناصر مثل آخر معنى بقي، عهد اليوم، أو جملة من أثري.
- [ ] [P1-12] بناء طفو جملة قديمة عند عدم وجود مراجعة أهم / لماذا: جعل الأثر السابق حياً داخل اليوم / القبول: تظهر جملة محفوظة سابقة فقط إذا لا توجد بوابة تعهد نشطة.
  - ↳ from `reflections[]` in `src/lib/storage.ts`, rendered in `STORY_AVAILABLE` state.
- [ ] [P1-13] منع تكرار نفس الجملة العائمة خلال فترة قصيرة / لماذا: منع تحوّل الأثر إلى ضجيج متكرر / القبول: لا تظهر الجملة نفسها مرة أخرى خلال ٧ أيام.
- [ ] [P1-14] تسجيل تفاعل المستخدم مع الجملة العائمة / لماذا: قياس هل الأثر القديم ما زال صادقاً / القبول: يُسجل `old_sentence_seen` و`old_sentence_answered` محلياً.
- [ ] [P1-15] تعديل صفحة "أثري" لتبدأ بالجمل والعهود لا الإحصاءات / لماذا: جعل الأثر ذاكرة لا لوحة إنجاز / القبول: أول أقسام أثري هي الجمل التي بقيت والعهود الأخيرة.
  - ↳ reorder sections in `src/app/trace/page.tsx`.
- [ ] [P1-16] إعادة صياغة إحصاءات "أثري" بلغة وصفية متواضعة / لماذا: منع تضخيم الذات بالأرقام / القبول: لا تستخدم الصفحة عبارات إنجازية مثل "أنجزت" أو "سلسلة".

## Phase 2 — العمق

- [ ] [P2-01] إلغاء "اختبار الأسبوع" كطقس ثابت / لماذا: لا نريد يوماً بلا قصة في نافذة هشّة من تكوين العادة / القبول: لا توجد حالة تمنع قصة اليوم بسبب مراجعة أسبوعية.
- [ ] [P2-02] بناء "ختمة المعنى" عند نهاية المسارات القصيرة / لماذا: طقس واحد قوي أفضل من مراجعة وسطية تعسفية / القبول: عند إتمام آخر قصة في مسار ١٠ قصص تظهر ختمة المسار.
- [ ] [P2-03] جعل ختمة المعنى تمتص أي مراجعة قوسية أخرى / لماذا: منع تعدد الطقوس التأملية المتقاربة / القبول: إذا اكتمل المسار اليوم لا تظهر "وقفة أثر" منفصلة.
- [ ] [P2-04] تصميم ختمة المسار حول الجملة والعهد وما بقي لا حول عدد القصص / لماذا: إغلاق القوس كأثر لا كإنجاز / القبول: الختمة تسأل عمّا انكشف أو بقي، ولا تبرز رقم الإكمال كوسام.
- [ ] [P2-05] بناء "وقفة أثر" للمسارات الطويلة فقط / لماذا: المسارات الطويلة تحتاج تجميعاً مرحلياً دون كسر اليوميات / القبول: المسارات ذات ١٢ قصة أو أقل لا تظهر فيها وقفة أثر وسطية.
- [ ] [P2-06] جعل "وقفة أثر" اختيارية بعد إتمام القصة لا قبلها / لماذا: لا نسحب المكافأة الأساسية من المستخدم / القبول: الوقفة تظهر فقط في `COMPLETED_TODAY` أو بعد إكمال القصة.
- [ ] [P2-07] تفعيل وقفة الأثر فقط عند توفر مادة حقيقية / لماذا: منع استخراج بصائر من نقرات فارغة / القبول: لا تظهر الوقفة إلا بعد حد أدنى من القصص والأيام وإشارات ذات معنى.
- [ ] [P2-08] استبعاد `no_situation` و`not_now` من مادة الاستنتاج / لماذا: هذه إجابات محترمة لكنها ليست دليلاً تأملياً / القبول: signal score لا يزيد بهذه الإجابات.
- [ ] [P2-09] عرض مواد خام في وقفة الأثر بدلاً من أحكام آلية قوية / لماذا: لا نستنتج أكثر مما تعرفه البيانات / القبول: الوقفة تعرض جملة/عهد/محاولة وتطلب من المستخدم اختيار ما يصفه.
- [ ] [P2-10] استخدام عبارة "الأيام القادمة" بدلاً من "الأسبوع القادم" / لماذا: الإيقاع ليس تقويمياً / القبول: لا تظهر صياغة "الأسبوع" في الوقفات أو الختمة.
- [ ] [P2-11] تخصيص وقفات أسماء الله الحسنى للمسار نفسه لا لكل التطبيق / لماذا: منع خلط المعاني وفقدان التماسك / القبول: وقفة الأسماء لا تسحب بيانات من مسارات كظم الغيظ أو الصدقة.
- [ ] [P2-12] تحويل تجربة الأسماء من قائمة فقط إلى "اسم اليوم" / لماذا: تقليل عبء ٩٩ اسماً على المستخدم الجديد / القبول: يوجد مدخل يومي واضح لاسم واحد دون تصفح القائمة.
  - ↳ `src/data/days.ts` (asmaNames) + names route under `src/app/tracks/[trackId]/names/`.
- [ ] [P2-13] إضافة مدخل "اسم يناسب حالك" / لماذا: جعل الأسماء رفقة لا موسوعة / القبول: المستخدم يختار حالة مثل ضيق أو خوف أو تردد فيُقترح اسم مناسب من المحتوى الموجود.
- [ ] [P2-14] تضييق نطاق الشات إلى "اسأل عن الاسم" لا "المساعد الإسلامي" العام / لماذا: تقليل مخاطر الفتوى والهلوسة / القبول: واجهة الشات ونصوصه توضّح أنه للتأمل في الأسماء لا للإفتاء.
  - ↳ `src/app/chat/page.tsx` + agent config.
- [ ] [P2-15] إضافة ردود حماية للشات عند أسئلة الفتوى أو العقيدة الحساسة / لماذا: حماية ثقة التطبيق / القبول: الأسئلة الخارجة عن نطاق الأسماء تُحوّل بلطف إلى طلب أهل العلم.

## Phase 3 — لاحقاً

- [ ] [P3-01] إضافة تصدير/استيراد "أثري" كاملاً / لماذا: حماية ذاكرة المستخدم من ضياع localStorage / القبول: يستطيع المستخدم تنزيل ملف واستعادته على جهاز آخر.
- [ ] [P3-02] دراسة حساب اختياري أو مزامنة اختيارية فقط / لماذا: الحفظ عبر الأجهزة مفيد لكن الحساب الإجباري يكسر البساطة / القبول: لا يظهر تسجيل دخول قبل قرار منتجي واضح.
- [ ] [P3-03] إضافة تذكير محلي اختياري بصياغة عهد لا إشعار استهلاك / لماذا: الرجوع اليومي يحتاج trigger محترم / القبول: المستخدم يفعّل تذكيراً مثل "هل اختبرت عهدك اليوم؟" ويستطيع إلغاءه بسهولة.
- [ ] [P3-04] بناء وضع قبل النوم / لماذا: كثير من الاستخدام المتوقع يحدث في نهاية اليوم / القبول: يوجد نمط قراءة أقل إضاءة وحركة وبنهاية هادئة.
- [ ] [P3-05] بناء onboarding بثلاثة أيام قبل فتح المكتبة كاملة / لماذا: تقليل تشتت المستخدم الجديد / القبول: أول مستخدم يرى مسار بداية قصير قبل قائمة المسارات الكبيرة.
- [ ] [P3-06] دراسة PWA/native بناءً على قناة التوزيع / لماذا: الإشعارات والحفظ والتثبيت تختلف جذرياً حسب المنصة / القبول: قرار موثق يحدد Web فقط أو PWA أو تطبيقات متاجر.
- [ ] [P3-07] إضافة مزامنة أو backup مشفر عند الحاجة فقط / لماذا: الخصوصية أصل في المنتج وليست ميزة ثانوية / القبول: لا تُرسل بيانات أثر شخصية دون موافقة صريحة.
- [ ] [P3-08] بناء analytics اختيارية مجهولة فقط إن احتجنا قياساً واسعاً / لماذا: المقاييس المحلية لا تكفي لاتخاذ قرارات عامة بعد الإطلاق / القبول: توجد موافقة واضحة، ولا تُرسل نصوص شخصية.

---

## القرارات المحسومة

- حد "اليوم" في كُنه هو ٤:٠٠ صباحاً حسب وقت الجهاز المحلي، لا UTC ولا منتصف الليل.
- يجب تثبيت `sessionDayKey` عند بدء القراءة واستخدامه عند الإكمال.
- Home له أربع حالات رئيسية فقط: لا مسار، بوابة تعهد، قصة متاحة، أُتمّت اليوم.
- اختيار الجملة والتعهد يبقيان داخل `CompletionFlow` لا كحالات Home مستقلة.
- بوابة التعهد تكون خفيفة ومطلوبة القرار فقط لتعهد أمس الطازج.
- التعهد المتأخر ٢–٦ أيام يظهر كبطاقة اختيارية لا تحجب القصة.
- التعهد الأقدم من ٦ أيام لا يظهر في Home.
- لا نعرض أكثر من تعهد واحد في Home.
- ندعم `soft_closed` للتعهدات القديمة أو المطوية دون حذفها.
- لا توجد قائمة ديون للتعهدات المعلقة في الصفحة الرئيسية.
- لا يوجد "اختبار أسبوع" كيوم ثابت أو يوم بلا قصة.
- "وقفة أثر" تظهر فقط عند توفر مادة حقيقية، وبعد القصة، وللمسارات الطويلة غالباً.
- المسارات القصيرة مثل ١٠ قصص تعتمد على "ختمة المعنى" لا مراجعة وسطية.
- ختمة المسار لها أولوية على أي وقفة أثر.
- المراجعة لا تستهلك قفل القصة اليومي ولا تفتح قصة إضافية.
- الجملة العائمة لا تظهر إذا توجد بوابة تعهد أهم.
- أرقام الإنجاز لا تكون صدر صفحة "اليوم".
- "أثري" يبدأ بالذاكرة والجمل والعهود، ثم الإحصاءات في الأسفل.
- event log محلي فقط في البداية، بلا سيرفر وبلا طرف ثالث.
- لا تُسجَّل نصوص التعهدات أو الجمل داخل أحداث القياس.
- مقاييس النجاح الأساسية ليست نقرة المراجعة الخام، بل فتح القصة بعد المراجعة، العودة بعد التعهد، وتوزيع الإجابات.
- لا نستخدم leaderboard أو badges أو gamification تنافسي.
- الشات يجب أن يكون ضيق النطاق حول الأسماء الحسنى لا مساعداً إسلامياً عاماً.

## الأسئلة المفتوحة + blocked-by

1. هل كُنه Web/PWA فقط أم تطبيق App Store/Google Play؟
   - blocked-by: [P3-03], [P3-06], أي قرار متعلق بالإشعارات الأصلية أو التثبيت أو native storage.
2. هل الإشعارات مرفوضة فلسفياً أم مؤجلة فقط؟
   - blocked-by: [P3-03], صياغة trigger الرجوع، واختبارات الاحتفاظ خارج التطبيق.
3. هل الأولوية القصوى هي الاحتفاظ اليومي أم العمق ولو قلّ الاستخدام؟
   - blocked-by: [P2-05], [P2-06], [P2-07], [P3-05], ضبط شدة البوابات والوقفات.
4. هل الجمهور الأساسي ملتزم دينياً أصلاً أم مستخدم عام يريد بداية هادئة؟
   - blocked-by: [P2-12], [P2-13], [P2-14], [P2-15], [P3-05], لغة المحاسبة والـonboarding.
5. هل localStorage مبدأ ثابت أم يوجد استعداد لحساب/مزامنة اختيارية؟
   - blocked-by: [P3-01], [P3-02], [P3-07], [P3-08], سياسة الخصوصية وbackup الأثر.
