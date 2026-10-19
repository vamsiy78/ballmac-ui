"use client"

import * as React from "react"

import { EmojiPicker, fromEmojibase, type EmojiData } from "@/components/ballmac/emoji-picker"
import { I18nProvider } from "@/lib/ballmac/i18n"

/** Another language is one function: load that language's Emojibase files and hand them to fromEmojibase. */
async function loadGerman(): Promise<EmojiData> {
  const [compact, messages] = await Promise.all([import("emojibase-data/de/compact.json"), import("emojibase-data/de/messages.json")])
  return fromEmojibase(compact.default, messages.default.groups)
}

export default function EmojiPickerGerman() {
  const [last, setLast] = React.useState("")
  return (
    <div className="flex flex-col items-center gap-3">
      <I18nProvider
        locale="de-DE"
        messages={{ "emoji-picker.search": "Emoji suchen", "emoji-picker.label": "Emoji-Auswahl", "emoji-picker.prompt": "Wähle ein Emoji", "emoji-picker.recent": "Zuletzt verwendet" }}
      >
        <EmojiPicker loadEmojis={loadGerman} storageKey="ballmac-emoji-de" onSelect={(e) => setLast(`${e.emoji} ${e.label}`)} />
      </I18nProvider>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {last || "Suche nach „Herz“ oder „Katze“"}
      </p>
    </div>
  )
}
