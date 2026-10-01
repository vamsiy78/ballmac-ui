"use client"

import { AiChat2 } from "@/components/ballmac/blocks/ai-chat-2/ai-chat-2"

const code = `<button class="rounded-full bg-black px-5 py-2 text-white">
  Get started
</button>`

export default function AiChat2Blank() {
  return (
    <AiChat2
      height="38rem"
      conversations={[{ id: "1", title: "Landing page button" }]}
      artifactTitle="CTA button"
      artifactKind="HTML snippet"
      filename="cta-button.html"
      language="html"
      suggestions={["Make it larger"]}
      defaultMessages={[
        { id: "u", role: "user", text: "Give me a rounded call-to-action button." },
        { id: "a", role: "assistant", artifact: 1, text: "Here is a pill-shaped button in black with white text. It works on any light background." },
      ]}
      versions={[
        {
          code,
          note: "A pill-shaped button",
          preview: <div className="flex h-full items-center justify-center p-10"><span className="rounded-full bg-black px-5 py-2 text-sm text-white">Get started</span></div>,
        },
      ]}
      onSend={async () => ({ reply: "I can make that larger or change the colour. Tell me which you would like." })}
    />
  )
}
