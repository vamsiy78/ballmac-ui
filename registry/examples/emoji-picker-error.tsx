"use client"

import * as React from "react"

import { EmojiPicker, type EmojiData } from "@/components/ballmac/emoji-picker"

export default function EmojiPickerError() {
  const loader = React.useCallback((): Promise<EmojiData> => Promise.reject(new Error("offline")), [])
  return <EmojiPicker loadEmojis={loader} onSelect={() => undefined} />
}