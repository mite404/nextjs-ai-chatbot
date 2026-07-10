'use client'

import type { UIMessage } from "ai";

import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageAvatar, MessageContent } from "@/components/ui/message";

// data
const AVATAR: Record<string, string> = { user: '🧑', assistant: '🤖' } // plain lookup table

// calculations
// pull readable text out of a message's parts array
/**
 * @param message - UI message whose text parts get concatenated
 * @returns the concatenated text of all `text` parts
 */
function textOf(message: UIMessage): string {
  return message.parts
    .filter((p) => p.type === 'text')
    .map((p) => (p as { text: string }).text)
    .join('')
}

/**
 * @param role - message role, e.g. `"user"` or `"assistant"`
 * @returns which side of the chat the bubble aligns to; `'end'` (right) for the user
 */
function alignFor(role: string): 'start' | 'end' {
  return role === 'user' ? 'end' : 'start'
}

/**
 * @param role - message role, e.g. `"user"` or `"assistant"`
 * @returns the bubble color variant for that role
 */
function variantFor(role: string): 'default' | 'secondary' {
  return role === 'user' ? 'default' : 'secondary'
}

/**
 * Renders a single chat message as an avatar + aligned, colored bubble.
 * @param message - UI message to render
 */
export function ChatMessage({ message }: { message: UIMessage }) {
  const align = alignFor(message.role)

  return (
    <Message align={align}>
      <MessageAvatar>{AVATAR[message.role] ?? '🤖'}</MessageAvatar>
      <MessageContent>
        <Bubble variant={variantFor(message.role)} align={align}>
          <BubbleContent>{textOf(message)}</BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  )
}
