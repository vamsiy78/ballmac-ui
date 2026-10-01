import { Download1 } from "@/components/ballmac/blocks/download-1/download-1"

export default function Download1Simple() {
  return (
    <Download1
      app="Tempo"
      glyph="T"
      tagline="A focus timer that lives in your menu bar."
      brew={null}
      steps={[]}
      requirements={["macOS 12 Monterey or later", "Universal app"]}
      downloads={{
        arm64: { href: "#", file: "Tempo-1.2.dmg", size: "21 MB" },
        x64: { href: "#", file: "Tempo-1.2.dmg", size: "21 MB" },
      }}
      releases={[{ version: "1.2", date: "2026-09-20", changes: [{ type: "new", text: "Long breaks after every fourth session" }, { type: "fixed", text: "The timer paused when the Mac slept" }] }]}
    />
  )
}
