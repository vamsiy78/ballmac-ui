"use client"

import { EmojiPicker } from "@/components/ballmac/emoji-picker"

/** A loader that never answers, to show the picker while its emoji are on the way. */
const never = () => new Promise<never>(() => undefined)

export default function EmojiPickerLoading() {
  return <EmojiPicker loadEmojis={never} onSelect={() => undefined} />
}