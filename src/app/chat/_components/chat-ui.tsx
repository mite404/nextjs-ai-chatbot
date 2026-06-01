'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useChat } from '@ai-sdk/react'
import { useState } from 'react'
import { TEXT_COLOR, CARD_BG } from '@/lib/colors'

export default function Chat() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status } = useChat()


  return (
    <div style={{
      color: TEXT_COLOR,

    }}>
      {messages.map((m) => (
        <div key={m.id}>
          {m.role === 'user' ? 'User: ' : 'AI: '}
          {m.parts.map((p, i) => (p.type === 'text' ? <span key={i}>{p.text}</span> : null))}
        </div>
      ))}
      <div>
        <form
          className='flex gap-2'
          onSubmit={e => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput('')
        }}
        >
          <Input
            className='flex-1 p-2 dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl'
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

    </div>
  )
}
