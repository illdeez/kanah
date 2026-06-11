"use client"

import { AgentChat, createAgentChat } from "@21st-sdk/nextjs"
import { useChat } from "@ai-sdk/react"
import TopBar from "@/components/TopBar"

const chat = createAgentChat({
  agent: "kanah-assistant",
  tokenUrl: "/api/an-token",
})

export default function ChatPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { messages, handleSubmit, status, stop, error } =
    useChat({ chat } as any) as any

  return (
    <div className="min-h-screen flex flex-col relative">
      <TopBar kicker="كَنْه" title="المساعد الإسلامي" />
      <p className="px-6 pt-3 text-[12.5px] text-kanah-muted">
        اسألني عن أسماء الله الحسنى
      </p>
      <div className="flex-1 relative z-10">
        <AgentChat
          messages={messages}
          onSend={() => handleSubmit()}
          status={status}
          onStop={stop}
          error={error ?? undefined}
        />
      </div>
    </div>
  )
}
