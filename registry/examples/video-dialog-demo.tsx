import { VideoDialog } from "@/components/ballmac/video-dialog"

function thumb() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f46e5"/><stop offset=".55" stop-color="#7c3aed"/><stop offset="1" stop-color="#db2777"/></linearGradient><radialGradient id="r" cx=".25" cy=".2" r=".8"><stop offset="0" stop-color="rgba(255,255,255,.35)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient></defs><rect width="960" height="540" fill="url(#g)"/><rect width="960" height="540" fill="url(#r)"/><g fill="rgba(255,255,255,.16)"><rect x="90" y="110" width="360" height="22" rx="11"/><rect x="90" y="150" width="260" height="14" rx="7"/><rect x="90" y="330" width="220" height="110" rx="14"/><rect x="330" y="330" width="220" height="110" rx="14"/><rect x="570" y="190" width="300" height="250" rx="18"/></g></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export default function VideoDialogDemo() {
  return (
    <div className="w-full max-w-xl">
      <VideoDialog title="Product tour: build a dashboard in 3 minutes" youtubeId="aqz-KE-bpKQ" thumbnail={thumb()} duration="3:12" />
    </div>
  )
}
