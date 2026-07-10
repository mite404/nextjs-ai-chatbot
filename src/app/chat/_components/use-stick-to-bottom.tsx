'use client'

import { useEffect, useRef, useState } from "react"

const BOTTOM_THRESHOLD = 24

// --- CALCULATION ---
// scrollHeight = full content height
// clientHeight = visible height
// scrollTop = how far we've scrolled down
// At the very bottom, scrollTop + clientHeight === scrollHeight, so distance === 0
function atBottom(scrollHeight: number, scrollTop: number, clientHeight: number): boolean {
  const distance = scrollHeight - scrollTop - clientHeight;

  return distance <= BOTTOM_THRESHOLD
}

// --- ACTION ---
function scrollToBottom(el: HTMLElement): void {
  el.scrollTop = el.scrollHeight
}

export function useStickToBottom(dep: unknown) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [pinned, setPinned] = useState(true)

  function handleScroll() {
    const el = scrollRef.current

    if (!el) return

    setPinned(atBottom(el.scrollHeight, el.scrollTop, el.clientHeight))
  }

  useEffect(() => {
    if (!pinned) return

    const el = scrollRef.current
    if (!el) return

    scrollToBottom(el)
  }, [dep, pinned])

  return { scrollRef, handleScroll, pinned }
}
