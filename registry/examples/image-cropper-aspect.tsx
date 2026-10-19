import * as React from "react"

import { ImageCropper } from "@/components/ballmac/image-cropper"

/** A picture drawn in code, so the example needs no file: a sky, a sun, hills and a few houses, with enough detail to see what a crop keeps. */
const scene = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(255,183,120)"/><stop offset="0.55" stop-color="rgb(255,222,170)"/><stop offset="1" stop-color="rgb(190,215,255)"/></linearGradient></defs><rect width="1600" height="1000" fill="url(#sky)"/><circle cx="1180" cy="330" r="130" fill="rgb(255,246,214)"/><path d="M0 680 Q300 480 620 640 T1240 600 T1600 660 V1000 H0Z" fill="rgb(112,148,120)"/><path d="M0 780 Q400 620 800 760 T1600 740 V1000 H0Z" fill="rgb(72,112,96)"/><g fill="rgb(245,235,220)"><rect x="300" y="700" width="120" height="90"/><rect x="470" y="730" width="90" height="70"/><rect x="1020" y="690" width="140" height="100"/></g><g fill="rgb(176,78,64)"><path d="M290 700 L360 640 L430 700Z"/><path d="M460 730 L515 685 L570 730Z"/><path d="M1010 690 L1090 620 L1170 690Z"/></g><g fill="rgb(40,60,52)"><rect x="880" y="690" width="14" height="70"/><circle cx="887" cy="672" r="42"/><rect x="1300" y="710" width="14" height="70"/><circle cx="1307" cy="692" r="38"/></g><text x="800" y="940" font-family="sans-serif" font-size="64" text-anchor="middle" fill="rgb(255,255,255)">GOLDEN HOUR</text></svg>`
)}`

const ratios = [
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
  { label: "3:4", value: 3 / 4 },
]

export default function ImageCropperAspect() {
  const [aspect, setAspect] = React.useState(16 / 9)
  return (
    <div className="grid w-full max-w-xl gap-3">
      <div role="group" aria-label="Shape of the crop" className="flex gap-1.5">
        {ratios.map((r) => (
          <button key={r.label} type="button" aria-pressed={aspect === r.value} onClick={() => setAspect(r.value)} className="h-8 rounded-md border px-3 text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground">
            {r.label}
          </button>
        ))}
      </div>
      <ImageCropper src={scene} aspect={aspect} alt="Crop the sunset picture" height={300} />
    </div>
  )
}
