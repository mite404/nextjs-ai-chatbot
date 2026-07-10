'use client'

import { useChat } from '@ai-sdk/react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageGroup } from '@/components/ui/message'
import { ChatMessage } from './chat-message'
import { useStickToBottom } from './use-stick-to-bottom'
import { TEXT_COLOR, CARD_BG } from '@/lib/colors'

export default function Chat() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status } = useChat()

  const streamedChars = messages.reduce(
    (n, m) =>
      n + m.parts.reduce((s, p) => s + (p.type === 'text' ? p.text.length : 0), 0),
    0
  )

  const { scrollRef, handleScroll, pinned } = useStickToBottom(streamedChars)

  return (
    <div
      className='fixed bottom-6 left-1/2 -translate-x-1/2 flex w-full max-w-2xl flex-col gap-4 px-4'
      style={{ color: TEXT_COLOR }}
    >
      {/* scroll viewport. ref + onScroll are the imperative DOM hooks */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className='flex max-h-[70vh] flex-col gap-2 overflow-y-auto'>
        <MessageGroup>
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}
        </MessageGroup>
      </div>

      {/* only shown when user has scrolled away (pinned === false) */}
      {!pinned && (
        <button
          type='button'
          onClick={() => {
            const el = scrollRef.current
            if (el) el.scrollTop = el.scrollHeight
          }}
          className="mx-auto rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs"
          >
            ↓ Jump to latest
          </button>
      )}

      <form
        className='flex gap-2'
        onSubmit={e => {
        e.preventDefault();
        sendMessage({ text: input });
        setInput('')
      }}
      >
        <Input
          className='flex-1 p-2 border border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 rounded shadow-xl'
          style={{
            color: TEXT_COLOR,
            borderColor: TEXT_COLOR,
            backgroundColor: CARD_BG,
          }}
          value={input}
          placeholder='How can I help you today...'
          onChange={e => setInput(e.currentTarget.value)}
        />
        <Button disabled={status !== 'ready'}>
          Submit
        </Button>
      </form>
    </div>
  )
}
