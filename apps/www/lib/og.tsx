import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

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

/** The item's light thumbnail as a JPEG data URL (made by `pnpm og:thumbs`), or undefined when there is none. */
export function ogThumb(name: string): string | undefined {
  const file = join(process.cwd(), ".og-thumbs", `${name}.jpg`)
  return existsSync(file) ? `data:image/jpeg;base64,${readFileSync(file).toString("base64")}` : undefined
}

/**
 * Share card for a block or template: the name and install line on the left, a picture of the item on the right. Falls
 * back to the text-only card when the item has no thumbnail.
 */
export function ogItemImage({ kind, name, title, subtitle, command, pro }: { kind: string; name: string; title: string; subtitle?: string; command: string; pro?: boolean }) {
  const thumb = ogThumb(name)
  if (!thumb) return ogImage({ eyebrow: kind, title, subtitle, command })
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#0e1020",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          color: "#f4f5fa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 500, padding: "64px 0 64px 64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 26, fontWeight: 600 }}>
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none" stroke="#f4f5fa" strokeWidth="1.9" strokeLinecap="round">
              <circle cx="16" cy="16" r="12.5" />
              <path d={SPIRAL} />
            </svg>
            Ballmac UI
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", gap: 12, fontSize: 20, letterSpacing: 5, textTransform: "uppercase", color: "#8fa6ff" }}>
              {kind}
              {pro ? <span style={{ color: "#f4f5fa", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6, padding: "0 8px", letterSpacing: 2 }}>Pro</span> : null}
            </div>
            <div style={{ display: "block", fontSize: 54, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05, lineClamp: 4 }}>{title}</div>
          </div>
          <div style={{ display: "flex", fontSize: 17, whiteSpace: "nowrap", color: "#cdd3ea", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "12px 16px", alignSelf: "flex-start" }}>
            $ {command}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 600,
            top: 96,
            display: "flex",
            padding: 10,
            borderRadius: 22,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain img */}
          <img src={thumb} width={760} alt="" style={{ borderRadius: 14, objectFit: "cover", objectPosition: "top" }} />
        </div>
      </div>
    ),
    ogSize
  )
}
