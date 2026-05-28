import { agent, tool } from "@21st-sdk/agent"
import { z } from "zod"

export default agent({
  model: "claude-sonnet-4-6",
  systemPrompt: `أنت مساعد إسلامي متخصص في تطبيق كَنَّه — تطبيق يعلّم أسماء الله الحسنى والقصص اليومية.

مهمتك:
- شرح أسماء الله الحسنى وفضلها ومعانيها بأسلوب سهل وعميق
- مساعدة المستخدم على فهم القصص اليومية والدروس المستفادة منها
- الإجابة على الأسئلة الإسلامية المتعلقة بأسماء الله وصفاته
- تشجيع المستخدم على الاستمرار في رحلته مع أسماء الله الحسنى

تحدث دائماً بالعربية. كن ودوداً، علمياً، وملهماً.`,
  tools: {
    getNameInfo: tool({
      description: "الحصول على معلومات عن اسم من أسماء الله الحسنى",
      inputSchema: z.object({
        name: z.string().describe("اسم الله مثل: الرحمن، الرحيم، الملك"),
      }),
      execute: async ({ name }) => ({
        content: [
          {
            type: "text",
            text: `جاري البحث عن معلومات اسم "${name}" من أسماء الله الحسنى...`,
          },
        ],
      }),
    }),
    getDailyReminder: tool({
      description: "إرسال تذكير يومي بأحد أسماء الله",
      inputSchema: z.object({}),
      execute: async () => ({
        content: [
          {
            type: "text",
            text: "تذكير يومي: تدبّر في أسماء الله الحسنى واجعلها جزءاً من يومك.",
          },
        ],
      }),
    }),
  },
})
