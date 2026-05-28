"use client"

import { AgentChat, createAgentChat } from "@21st-sdk/nextjs"
import { useChat } from "@ai-sdk/react"

const chat = createAgentChat({
  agent: "kanah-assistant",
  tokenUrl: "/api/an-token",
})

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, status, stop, error } =
    useChat({ chat })

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <div className="border-b border-white/10 px-6 py-4">
        <h1 className="text-white text-xl font-semibold">المساعد الإسلامي</h1>
        <p className="text-white/40 text-sm">اسألني عن أسماء الله الحسنى</p>
      </div>
      <div className="flex-1">
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
