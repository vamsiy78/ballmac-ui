import { Media } from "@/components/ballmac/media"

const svg = (bg: string, fg: string, label: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="${bg}"/><rect x="40" y="40" width="560" height="64" rx="12" fill="${fg}" opacity=".18"/><text x="320" y="210" font-family="sans-serif" font-size="28" text-anchor="middle" fill="${fg}">${label}</text></svg>`)}`

export default function MediaDark() {
  return (
    <div className="w-full max-w-xl">
      <Media
        media={{ src: svg("#f8fafc", "#0f172a", "Light screenshot"), srcDark: svg("#0b1020", "#e2e8f0", "Dark screenshot"), alt: "The inbox in the current colour scheme" }}
        aspect="video"
        className="rounded-xl border"
      />
      <p className="text-muted-foreground mt-2 text-xs">Switch the theme to swap the file.</p>
    </div>
  )
}
