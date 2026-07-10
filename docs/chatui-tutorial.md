# Tutorial: A Streaming Chat UI with shadcn Bubbles + Stick-to-Bottom

**Goal:** Build your own chat UI that renders **streaming** AI-SDK messages (from
OpenRouter) inside shadcn `Bubble` / `Message` primitives, and keeps the newest
tokens in view — **auto-pinning to the bottom** as the model streams, while
**yielding to the user** the moment they scroll up.

Estimated time: about an hour.

**What you'll practice:**

- The **Data / Calculations / Actions** model — sorting every line of code into
  exactly one of three buckets
- **Leaf-to-trunk** file layout: imports → data → calculations → actions → main
- Why the *pin decision* is a pure **calculation** (and therefore testable with no
  browser) while reading/writing scroll position are **actions**
- Mapping an AI-SDK `UIMessage` (with its `parts[]` array) onto shadcn primitives
- How `useChat` streams — why the last bubble grows token-by-token
- Refs vs. state, and `useEffect` dependency arrays as a "content changed" trigger
- Deriving a per-token "content changed" signal with a nested `reduce` — and why a
  function that reads a stream's *result* can still be a pure Calculation
- Encapsulation: exposing an **action** from a hook (`jumpToBottom`) so the
  component never has to touch `scrollRef.current` or DOM properties itself

You already have the two primitives installed:

- `src/components/ui/bubble.tsx` — `Bubble`, `BubbleContent`, `BubbleGroup`, `BubbleReactions`
- `src/components/ui/message.tsx` — `Message`, `MessageAvatar`, `MessageContent`, `MessageGroup`, `MessageHeader`, `MessageFooter`

Reference docs for the design language you're matching:

- https://ui.shadcn.com/docs/components/base/bubble
- https://ui.shadcn.com/docs/components/base/message

---

## Part 1 — The Three Categories: Data, Calculations, Actions

Before writing a line, understand the model that shapes how these files are
organized. Every piece of code you write falls into exactly one of three buckets.
Sorting code this way is the single most useful habit for keeping a UI debuggable.

### Data

Plain values. No logic, no behavior — just shape.

A string is data. A lookup object is data. A pixel threshold is data.

```ts
const BOTTOM_THRESHOLD = 24 // data — how close to the bottom counts as "at bottom"

const AVATAR = { user: '🧑', assistant: '🤖' } // data — a role → emoji table
```

### Calculations

Pure functions. Same input → same output, every time. No DOM reads, no network,
no `Date.now()`, no React state — nothing outside the arguments.

A calculation is safe to call zero times, once, or a thousand times — the world
stays the same. **You can test it by just calling it and checking the return
value. No browser, no server, no mocking.**

```ts
function atBottom(scrollHeight: number, scrollTop: number, clientHeight: number): boolean {
  return scrollHeight - scrollTop - clientHeight <= BOTTOM_THRESHOLD // calculation
}
```

This is the heart of the stick-to-bottom feature — the *decision* "are we pinned?"
— and it's pure. Three numbers in, one boolean out. Notice it does **not** touch a
DOM node; it receives the numbers already extracted. That separation is deliberate.

### Actions

Functions that touch the world. Reading `el.scrollTop` off a live DOM node is an
action (the value depends on when you look). Writing `el.scrollTop` is an action.
Calling React's `setState` is an action. `fetch()` is an action.

An action depends on *when* and *how many times* you call it.

```ts
function scrollToBottom(el: HTMLElement): void {
  el.scrollTop = el.scrollHeight // action — mutates the live DOM
}
```

### The payoff: actions do I/O, calculations do logic

Watch how they pair up. The action reads the messy outside world, then hands clean
numbers to the calculation to make the decision:

```ts
function handleScroll() {
  const el = scrollRef.current
  if (!el) return
  //         ↓ action reads the DOM        ↓ calculation decides    ↓ action sets state
  setPinned(atBottom(el.scrollHeight, el.scrollTop, el.clientHeight))
}
```

The action is a thin shell around the pure calculation. All the *reasoning*
("near the bottom?") lives in `atBottom`, which you can unit-test in isolation.
The action just does the unavoidable DOM I/O. Keep logic in calculations, keep I/O
in actions, and bugs have far fewer places to hide.

---

## Part 2 — The leaf-to-trunk rule

Write your **leaves** (data, then pure calculations) at the top of each file.
Write your **trunk** (main — the component or hook that calls everything) at the
bottom.

Leaves depend on nothing custom above them — they're self-contained. The trunk
depends on leaves, so it must come after. This isn't only style: JavaScript reads
top to bottom, and more importantly, every function you meet should only call
things already defined *above it*, so you can read the file straight through
without jumping around.

```
FILE LAYOUT (each file)
─────────────────────────────
1. imports          ← third-party + primitives
2. DATA             ← plain values, no logic
3. CALCULATIONS     ← pure functions (no DOM, no state, no network)
4. ACTIONS          ← DOM reads/writes, setState, network
5. MAIN             ← the trunk: the component or hook that wires it together
```

A React component or a custom hook *is* the trunk — the equivalent of a script's
`main()`. It contains no pure logic of its own; it composes data + calculations +
actions into rendered output.

---

## Part 3 — Primitive anatomy cheat sheet

The `Bubble` and `Message` primitives contain **no logic** — they stamp
`data-slot` / `data-align` / `data-variant` onto the DOM, and Tailwind selectors
react to those attributes. Your job is never to style; it's to pass the right
`variant` and `align` (both **data**, chosen by a **calculation**).

| You want…                        | Primitive + prop                      | What it does                                        |
| -------------------------------- | ------------------------------------- | --------------------------------------------------- |
| A row (avatar + content)         | `<Message align="start\|end">`        | Lays out one message; `end` = right-aligned         |
| The rounded speech bubble        | `<Bubble variant="..." align="...">`  | The colored pill; `variant` picks the color scheme  |
| Text inside the bubble           | `<BubbleContent>`                      | Padding, wrapping, the actual `bg-*` target         |
| A little avatar circle           | `<MessageAvatar>`                      | 32px circle, self-aligned to the bubble's bottom    |
| Column of parts in one message   | `<MessageContent>`                     | Stacks bubbles/parts vertically                     |
| A name / timestamp               | `<MessageHeader>` / `<MessageFooter>` | Tiny muted text, auto-aligns with the message       |
| Group several messages           | `<MessageGroup>` / `<BubbleGroup>`    | `flex flex-col gap` wrappers                         |

**`align` convention:** `start` = left (assistant), `end` = right (user).
**`variant` palette:** `default`, `secondary`, `muted`, `tinted`, `outline`,
`ghost`, `destructive`. Chat convention: user = `default`, assistant = `muted`.

---

## Part 4 — The scaffold

Three files. **Read every section before editing.** Provided code shows you the
pattern; the real exercises are marked `TODO(you)`. Implement them one at a time
and re-test.

The exercises mirror the Data/Calculations/Actions split:

- **File A** is all provided — read it to see the **calculation** pattern (pure
  functions that pick presentation from a role).
- **File B** has three stubs: **one calculation** (`atBottom`) and **two actions**
  (`handleScroll`, the re-pin effect).
- **File C** is the trunk — but it has two stubs of its own: **one calculation**
  (`countStreamedChars`, the value that actually drives the stream-following
  behavior) and **one action-reuse exercise** (wiring the "Jump to latest" button
  to an action the hook already exposes, instead of re-deriving it).

### File A — `src/app/chat/_components/chat-message.tsx` (read, don't implement)

Renders one `UIMessage`. Study how DATA and CALCULATIONS sit above MAIN, and how
`main` (the component) contains no logic — just composition.

```tsx
'use client'

// ── 1. IMPORTS ────────────────────────────────────────────────────────────────
import type { UIMessage } from 'ai'

import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Message, MessageAvatar, MessageContent } from '@/components/ui/message'

// ── 2. DATA ───────────────────────────────────────────────────────────────────
// Plain lookup table. No logic — just shape. role → emoji.
const AVATAR: Record<string, string> = { user: '🧑', assistant: '🤖' }

// ── 3. CALCULATIONS ───────────────────────────────────────────────────────────
// Pure. Same input → same output. No DOM, no React, no side effects.
// These are LEAVES — provided so you can see the calculation pattern.

// Pull the readable text out of a message's parts array. A message's `parts` can
// hold text, tool calls, reasoning, files; we keep only the text parts for now.
function textOf(message: UIMessage): string {
  return message.parts
    .filter((p) => p.type === 'text')
    .map((p) => (p as { text: string }).text)
    .join('')
}

// role → bubble alignment. 'end' = right (the user's side).
function alignFor(role: string): 'start' | 'end' {
  return role === 'user' ? 'end' : 'start'
}

// role → bubble color variant. No color code here — just a name the CSS reacts to.
function variantFor(role: string): 'default' | 'muted' {
  return role === 'user' ? 'default' : 'muted'
}

// ── 5. MAIN (trunk) ───────────────────────────────────────────────────────────
// The component. No pure logic of its own — it composes DATA + CALCULATIONS into
// the primitives. (No section 4: rendering one message has no actions.)
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
```

### File B — `src/app/chat/_components/use-stick-to-bottom.ts` (the exercises)

The viewport logic. Note the section banners — same leaf-to-trunk order. The
`atBottom` calculation sits above the actions that use it; the hook (main) sits at
the bottom.

```tsx
'use client'

// ── 1. IMPORTS ────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react'

// ── 2. DATA ───────────────────────────────────────────────────────────────────
// How close to the bottom (px) still counts as "at the bottom". A few px of slack
// absorbs sub-pixel rounding and the last line's leading. (data, not logic)
const BOTTOM_THRESHOLD = 24

// ── 3. CALCULATIONS ───────────────────────────────────────────────────────────
// Pure. Numbers in, boolean out. No DOM, no React. Because it's pure you can
// unit-test the pin decision with no browser:
//   atBottom(1000, 976, 24)  === true   // distance 0  → pinned
//   atBottom(1000, 500, 400) === false  // distance 100 → not pinned

// ── Stub 1: atBottom (CALCULATION) ─────────────────────────────────────────────
// CATEGORY: Calculation — three numbers in, one boolean out. This is the *whole
// decision* of the feature ("are we pinned?"), isolated from any DOM read.
//
// TODO(you): implement atBottom.
//   distance = scrollHeight - scrollTop - clientHeight
//   return true when distance <= BOTTOM_THRESHOLD, else false.
// Why these three: scrollHeight = full content height; clientHeight = visible
// height; scrollTop = how far we've scrolled down. At the very bottom,
// scrollTop + clientHeight === scrollHeight, so distance === 0.
function atBottom(scrollHeight: number, scrollTop: number, clientHeight: number): boolean {
  // TODO(you)
  return false // remove when implemented
}

// ── 4. ACTIONS ────────────────────────────────────────────────────────────────
// Functions that touch the world: read the live DOM, write scroll position, call
// setState. They depend on WHEN and HOW MANY times they run.

// Provided (read): write the scroll position to the bottom. Action — mutates DOM.
function scrollToBottom(el: HTMLElement): void {
  el.scrollTop = el.scrollHeight
}

// ── 5. MAIN (trunk) ───────────────────────────────────────────────────────────
// The hook. Wires DATA + the CALCULATION + the ACTIONS together and returns the
// three things the component needs. `dep` is a value that changes on every new
// token (see File C) — changing it re-runs the re-pin effect.
export function useStickToBottom(dep: unknown) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [pinned, setPinned] = useState(true)

  // ── Stub 2: handleScroll (ACTION) ─────────────────────────────────────────────
  // CATEGORY: Action — reads live geometry off the DOM node (impure input) and
  // calls setPinned (a side effect). It DELEGATES the decision to the pure
  // calculation atBottom: the action does I/O, the calculation does logic.
  //
  // Note: we do NOT try to tell "user scrolled" apart from "we scrolled". We just
  // recompute atBottom on every scroll event. Programmatic scroll lands at the
  // bottom → atBottom true → stays pinned. User drags up → atBottom false →
  // unpinned. Same code handles both.
  //
  // TODO(you):
  //   1. el = scrollRef.current; if (!el) return.
  //   2. setPinned( atBottom(el.scrollHeight, el.scrollTop, el.clientHeight) ).
  function handleScroll() {
    // TODO(you)
  }

  // ── Stub 3: re-pin effect (ACTION) ────────────────────────────────────────────
  // CATEGORY: Action — runs whenever `dep` or `pinned` changes; mutates the DOM
  // scroll position. This is the "auto-follow the stream" behavior. It must NOT
  // scroll when the user has unpinned — that's what keeps the view fixed where
  // they scrolled.
  //
  // TODO(you):
  //   1. if (!pinned) return         ← respect the user's scroll position
  //   2. el = scrollRef.current; if (!el) return.
  //   3. scrollToBottom(el).
  useEffect(() => {
    // TODO(you)
  }, [dep, pinned])

  // Provided: expose the SAME scrollToBottom action to callers, wrapped so it
  // reads the current ref itself. This is the whole point of a custom hook —
  // the component that uses useStickToBottom should never need to know a ref
  // or a DOM property exists. It just calls an action by name.
  function jumpToBottom() {
    const el = scrollRef.current
    if (!el) return
    scrollToBottom(el)
  }

  return { scrollRef, handleScroll, pinned, jumpToBottom }
}
```

### File C — `chat-ui.tsx` (the trunk — two more stubs)

This replaces the message-rendering part of your existing `chat-ui.tsx`; the
composer form stays as you already have it. The component is MAIN — it wires
`useChat` (an action-producing hook), the `useStickToBottom` hook, and the
`ChatMessage` calculation-driven component together.

Unlike File A, this file **does** have its own logic worth writing yourself: the
value that makes the stream-following behavior actually work (`countStreamedChars`),
and a small but real lesson in *not* duplicating an action across files.

```tsx
'use client'

// ── 1. IMPORTS ────────────────────────────────────────────────────────────────
import { useChat } from '@ai-sdk/react'
import type { UIMessage } from 'ai'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageGroup } from '@/components/ui/message'
import { TEXT_COLOR, CARD_BG } from '@/lib/colors'
import { ChatMessage } from './chat-message'
import { useStickToBottom } from './use-stick-to-bottom'

// ── 3. CALCULATIONS ───────────────────────────────────────────────────────────
// Pure. A UIMessage[] snapshot in, a number out. No DOM, no React state — even
// though `messages` originally came from a hook that streams over the network,
// by the time this function receives it, it's just a value. See Q8/A8.

// ── Stub 4: countStreamedChars (CALCULATION) ──────────────────────────────────
// CATEGORY: Calculation — this IS the `dep` from Q5/A5. It must increase on
// every token, not just on every new message, or the re-pin effect won't follow
// a live stream (recall: messages.length and status both sit still mid-stream).
//
// TODO(you): implement countStreamedChars.
//   For every message, for every part where part.type === 'text', add up
//   part.text.length. Sum across all messages. Return the total.
// Hint: nested reduce — outer reduce over `messages`, inner reduce over
// `message.parts`. A part only has `.text` when `part.type === 'text'` —
// narrow the type before reading it (same pattern as `textOf` in File A).
function countStreamedChars(messages: UIMessage[]): number {
  // TODO(you)
  return 0 // remove when implemented
}

// ── 5. MAIN (trunk) ───────────────────────────────────────────────────────────
// The component. Composes the CALCULATION above with hooks (actions) and the
// ChatMessage component. Holds no other logic of its own.
export default function Chat() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status } = useChat()

  const { scrollRef, handleScroll, pinned, jumpToBottom } = useStickToBottom(
    countStreamedChars(messages)
  )

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 flex w-full max-w-2xl flex-col gap-4 px-4"
      style={{ color: TEXT_COLOR }}
    >
      {/* The scroll viewport. ref + onScroll are the imperative DOM hooks. */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex max-h-[70vh] flex-col overflow-y-auto"
      >
        <MessageGroup>
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}
        </MessageGroup>
      </div>

      {/* ── Stub 5: wire the button to REUSE an action, not re-derive one ──── */}
      {/* CATEGORY: the click handler is an Action. `useStickToBottom` already   */}
      {/* built and returned `jumpToBottom` — the exact action this button      */}
      {/* needs. Don't write a second copy of "set scrollTop to scrollHeight"   */}
      {/* here; that would duplicate logic that already lives in               */}
      {/* use-stick-to-bottom.ts and can drift out of sync with it over time.   */}
      {/*                                                                       */}
      {/* TODO(you): delete the two lines in onClick below and replace them     */}
      {/* with a single call: jumpToBottom()                                    */}
      {!pinned && (
        <button
          type="button"
          onClick={() => {
            // TODO(you): replace this with jumpToBottom()
            const el = scrollRef.current
            if (el) el.scrollTop = el.scrollHeight
          }}
          className="mx-auto rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs"
        >
          ↓ Jump to latest
        </button>
      )}

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          sendMessage({ text: input })
          setInput('')
        }}
      >
        <Input
          className="flex-1 rounded border border-zinc-300 p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          style={{ color: TEXT_COLOR, borderColor: TEXT_COLOR, backgroundColor: CARD_BG }}
          value={input}
          placeholder="How can I help you today..."
          onChange={(e) => setInput(e.currentTarget.value)}
        />
        <Button disabled={status !== 'ready'}>Submit</Button>
      </form>
    </div>
  )
}
```

---

## Part 5 — Run it

```bash
pnpm dev
```

Log in, send a message. As the assistant streams, the view should **follow the
bottom automatically**. Scroll up mid-stream — it should **freeze** where you left
it, and the "↓ Jump to latest" pill should appear. Scroll back to the bottom (or
click the pill) and auto-follow resumes.

If it doesn't behave yet, you still have `TODO(you)` stubs to fill. Do them in
dependency order — `atBottom` first (File B's leaf), then File B's two actions,
then `countStreamedChars` (File C's leaf), then wire the button — and re-test
after each.

---

## Quizzes

Answer from memory. Answers — and the correct stub implementations — are at the bottom.

**Q1.** `atBottom` is a Calculation; `handleScroll` and the re-pin effect are
Actions. What is the test-writability difference? Why can you test `atBottom`
without opening a browser or starting the dev server?

**Q2.** `handleScroll` reads `el.scrollHeight`, `el.scrollTop`, `el.clientHeight`
and passes them to `atBottom`. Why is *reading* those off the live DOM node an
Action, even though the numbers themselves are just data? What category is the
`atBottom` call that consumes them?

**Q3.** The design deliberately does **not** distinguish "the user scrolled" from
"we scrolled programmatically." Explain why recomputing `atBottom` on every scroll
event handles both cases correctly, without ever knowing who caused the scroll.

**Q4.** Stub 3's effect returns early when `pinned` is false. Walk through what the
user experiences if you *delete* that line. Which required behavior — "auto-pin" or
"yield to the user" — breaks, and which still works?

**Q5.** `useStickToBottom(streamedChars)` passes a changing value as `dep`. Why
does the effect need a `dep` at all instead of running once on mount? And why are
`messages.length` *and* `status` both useless as the dep for following a live
*stream* — what changes per token that they don't?

**Q6.** The files put DATA above CALCULATIONS above ACTIONS above MAIN, leaf to
trunk. Besides style, give the practical reading benefit: what is true about every
function you encounter as you read one of these files top to bottom?

**Q7 (bonus).** In `ChatMessage`, the `Bubble` has no `if (isUser)` and no color
code, yet user and assistant bubbles differ in color. Trace the mechanism: which
*calculation* runs, what *data* it returns, and how that produces a different
color without any styling logic in your component.

**Q8.** `countStreamedChars(messages)` takes the full `UIMessage[]` array — an
array that ultimately came from `useChat`, a hook that performs real network
Actions (streaming). Why is `countStreamedChars` still a Calculation, not an
Action, even though the data it reads originated from streaming?

**Q9.** The "Jump to latest" button could call `el.scrollTop = el.scrollHeight`
directly from `chat-ui.tsx` (as an earlier draft did), or it can call
`jumpToBottom()` returned from `useStickToBottom`. Concretely, what goes wrong
later if you keep the first approach and then someone changes how "scroll to
bottom" works (e.g., switches to smooth scrolling, or adds a "leave 4px of
overscroll" tweak) inside `use-stick-to-bottom.ts`?

---

## Answers

---

**A1.** A Calculation only takes inputs and returns an output. You can call
`atBottom(1000, 500, 400)` in a plain test and assert it returns `false` — no DOM,
no server, no timing. An Action touches the world: to exercise `handleScroll` you'd
need a real scroll container in a browser with a live `scrollTop`. Keeping the
decision (`atBottom`) separate from the I/O (`handleScroll`) means you can test and
trust the *logic* before the messy world ever enters the picture.

---

**A2.** `el.scrollTop` (and friends) is a **read of external mutable state** — the
number depends on *when* you look, because the user or the browser may have moved
the scroll between two reads. Anything whose result depends on *when* you call it is
an Action. Once you've captured those three numbers, though, they're just **data**,
and `atBottom(...)` is a **Calculation**: given the same three numbers it always
returns the same boolean. The action's job is to grab the volatile numbers; the
calculation's job is to reason about them.

---

**A3.** Because "should we be following the stream?" is fully answered by *where the
scroll position is now*, not by *who moved it*. On every scroll event you recompute
`atBottom`:

- We programmatically jump to the bottom → distance ≈ 0 → `atBottom` true →
  `setPinned(true)` → we keep following. Correct.
- The user drags up → distance grows past the threshold → `atBottom` false →
  `setPinned(false)` → the effect's early-return stops following. Correct.
- The user scrolls back to the bottom → distance ≈ 0 again → pinned true → following
  resumes. Correct.

Tagging scrolls as "human" vs. "programmatic" would need flags and timers and still
race. The calculation is stateless about *cause* and only cares about *result* —
which is all the behavior actually depends on.

---

**A4.** Deleting `if (!pinned) return` breaks "**yield to the user**." Auto-pin
still works — new tokens still scroll to the bottom. But now the effect scrolls to
the bottom on *every* content change regardless of `pinned`, so the instant the user
scrolls up to read, the next streamed token yanks them back down. The view becomes
unreadable during a stream. That one line is the entire "stay where the user
scrolled" half of the feature.

---

**A5.** `useEffect` only re-runs when a dependency changes. With `[]` it fires once
on mount, scrolls the empty list, and never runs again — nothing would follow
anything. It must re-run *each time new content arrives*, so it needs a `dep` that
changes then.

The trap is picking a `dep` that looks like it changes but doesn't. During a
streaming response, **both** obvious candidates sit still:

- `messages.length` — constant mid-stream. No new messages are added; a single
  assistant message is being *appended to*, so the count never moves.
- `status` — constant mid-stream. It holds the value `'streaming'` the entire time
  tokens arrive; it only flips on the transitions (`submitted → streaming → ready`),
  not per token.

So `messages.length + status` is the same value on every render of the stream (e.g.
`"3streaming"`), React's `Object.is` sees no change, and the effect **doesn't re-run
while tokens flow** — the view would only snap to the bottom when the answer starts
and finishes, drifting out of sight during a long one.

What actually changes per token is the **text itself growing**. So we derive a value
from it — `streamedChars`, the total count of streamed text characters across all
messages. Each token adds characters, so the count ticks up on every render of the
stream, re-running the effect and gluing the view to the newest token. (Any
per-token-changing value works: the streamed text length, or a hash of it. The key
property is that it moves when the *content* moves, not just when the message *count*
or *status* moves.)

---

**A6.** Every function you meet only calls things already defined *above it*. Data
depends on nothing; calculations depend only on data and other calculations;
actions may call calculations; main calls everything. So you can read the file
straight through, top to bottom, and never hit a name you haven't already seen
defined. No scrolling back up, no forward references — the file explains itself in
reading order.

---

**A7.** The calculation `variantFor(message.role)` runs. For an assistant it returns
the **data** value `'muted'`; for the user, `'default'`. That string is passed to
`<Bubble variant={...}>`, which stamps `data-variant="muted"` onto its `<div>`. The
primitive's `bubbleVariants` stylesheet has a selector like
`*:data-[slot=bubble-content]:bg-primary` for `default` and a different `bg-*` for
`muted`; the changed DOM attribute makes a different Tailwind rule match, painting a
different background. Your component holds no color logic at all — it only ran a
calculation to pick a variant name, and CSS did the rest.

---

**A8.** Classification depends on what the function *in front of you* does with the
value it was handed — not on where that value came from three steps upstream. By
the time `countStreamedChars` runs, `messages` is already a plain array sitting in
memory: a **snapshot** taken for this render. `countStreamedChars` only reads that
snapshot and returns a derived number; call it twice with the same array and you
get the same number both times. It never calls `fetch`, never subscribes to
anything, never depends on *when* it's called. The Action — the actual network
streaming — already happened upstream, inside `useChat`. This is the same
"snapshot" idea from Part 1's `messages[]` discussion: impurity gets sealed inside
the one hook that does the I/O, and everything downstream that only *reads* the
result it produced is free to be pure.

---

**A9.** Hardcoding `el.scrollTop = el.scrollHeight` in `chat-ui.tsx` creates a
**second, independent copy** of the exact behavior already written once, as
`scrollToBottom`, inside `use-stick-to-bottom.ts`. If someone later changes what
"scroll to bottom" means there — smooth scrolling, an overscroll tweak, whatever —
they'd update `scrollToBottom` and the re-pin effect that calls it, and have no
reason to think a *second* copy exists sitting in a completely different file. The
button would silently keep the old behavior, and the two would drift apart with no
error, no warning — just an inconsistent UI a future you has to rediscover by
noticing the button "feels different" from auto-scroll. Calling `jumpToBottom()`
instead means there is exactly **one** definition of "scroll to bottom," owned by
the hook; every caller — the effect, the button, anything else later — goes through
it. It's also why the hook returns `jumpToBottom` rather than just handing back
`scrollRef` for the component to poke at directly: `chat-ui.tsx` never needs to know
`.scrollTop`/`.scrollHeight` exist at all. It only calls named actions.

---

## The correct stub implementations

### Stub 1 — `atBottom` (Calculation)

```tsx
function atBottom(scrollHeight: number, scrollTop: number, clientHeight: number): boolean {
  return scrollHeight - scrollTop - clientHeight <= BOTTOM_THRESHOLD
}
```

Pure: three numbers in, one boolean out. Test it directly —
`atBottom(1000, 976, 24) === true`, `atBottom(1000, 500, 400) === false` — with no
browser at all. That testability is *why* the decision lives in a calculation
instead of inside the scroll handler.

### Stub 2 — `handleScroll` (Action)

```tsx
function handleScroll() {
  const el = scrollRef.current
  if (!el) return
  setPinned(atBottom(el.scrollHeight, el.scrollTop, el.clientHeight))
}
```

A thin shell: read the three volatile numbers off the DOM (the action), delegate
the decision to `atBottom` (the calculation), push the result into state (the
action).

### Stub 3 — the re-pin effect (Action)

```tsx
useEffect(() => {
  if (!pinned) return // ← respect the user's scroll position
  const el = scrollRef.current
  if (!el) return
  scrollToBottom(el) // ← the only DOM write
}, [dep, pinned])
```

`if (!pinned) return` turns "always auto-scroll" (annoying) into "auto-scroll unless
the user took over" (correct).

### Stub 4 — `countStreamedChars` (Calculation)

```tsx
function countStreamedChars(messages: UIMessage[]): number {
  return messages.reduce(
    (total, message) =>
      total +
      message.parts.reduce(
        (sum, part) => sum + (part.type === 'text' ? part.text.length : 0),
        0
      ),
    0
  )
}
```

The outer `reduce` walks the messages; the inner `reduce` walks one message's
`parts` and only counts `text` parts' length. Same `messages` in → same number out,
always — pure, despite `messages` having streamed in from the network upstream.

### Stub 5 — wire the button to `jumpToBottom` (Action reuse)

```tsx
onClick={jumpToBottom}
```

That's the entire change: delete the two-line inline handler and pass the hook's
own action directly as the click handler (no arrow-function wrapper needed —
`jumpToBottom` already takes no arguments and returns nothing). Every "scroll to
the bottom" behavior in the app now funnels through one function, in one file.

---

## Where to go next

- **Render tool parts.** `textOf` throws away non-text parts. Add a calculation
  that maps `part.type === 'tool-weather'` to a small `<Bubble variant="outline">`
  showing the tool call + result.
- **Message headers/footers.** Wrap bubbles in `<MessageHeader>` (a name) and
  `<MessageFooter>` (a timestamp) — both auto-align with the message side.
- **Reactions.** `BubbleReactions` (already in `bubble.tsx`) floats an emoji
  affordance on a bubble corner. Try it on hover.
- **Smooth scroll.** Change `scrollToBottom` to
  `el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })` and judge whether the
  smoothness helps or fights the fast stream cadence.
```
