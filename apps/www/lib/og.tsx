import { ImageResponse } from "next/og"

import { SPIRAL } from "@/components/site/spiral"

export const ogSize = { width: 1200, height: 630 }

/** Shared Open Graph card: ink background, hairline grid, mono eyebrow, title and install line. */
export function ogImage({ eyebrow, title, subtitle, command }: { eyebrow: string; title: string; subtitle?: string; command?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0e1020",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          color: "#f4f5fa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, fontWeight: 600 }}>
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none" stroke="#f4f5fa" strokeWidth="1.9" strokeLinecap="round">
            <circle cx="16" cy="16" r="12.5" />
            <path d={SPIRAL} />
          </svg>
          Ballmac UI
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 22, letterSpacing: 6, textTransform: "uppercase", color: "#8fa6ff" }}>{eyebrow}</div>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -3, lineHeight: 1.02, maxWidth: 1000 }}>{title}</div>
          {subtitle ? <div style={{ fontSize: 28, color: "#a6adc8", maxWidth: 980, lineHeight: 1.35 }}>{subtitle}</div> : null}
        </div>
        {command ? (
          <div style={{ display: "flex", fontSize: 24, color: "#cdd3ea", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "14px 20px", alignSelf: "flex-start" }}>
            $ {command}
          </div>
        ) : (
          <div style={{ fontSize: 24, color: "#a6adc8" }}>ui.ballmac.com</div>
        )}
      </div>
    ),
    ogSize
  )
}
