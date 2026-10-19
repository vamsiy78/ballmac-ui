"use client"

import * as React from "react"
import { Upload } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { ImageCropper, type ImageCropperHandle } from "@/components/ballmac/image-cropper"

/** A picture drawn in code, so the example needs no file: a sky, a sun, hills and a few houses, with enough detail to see what a crop keeps. */
const scene = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(255,183,120)"/><stop offset="0.55" stop-color="rgb(255,222,170)"/><stop offset="1" stop-color="rgb(190,215,255)"/></linearGradient></defs><rect width="1600" height="1000" fill="url(#sky)"/><circle cx="1180" cy="330" r="130" fill="rgb(255,246,214)"/><path d="M0 680 Q300 480 620 640 T1240 600 T1600 660 V1000 H0Z" fill="rgb(112,148,120)"/><path d="M0 780 Q400 620 800 760 T1600 740 V1000 H0Z" fill="rgb(72,112,96)"/><g fill="rgb(245,235,220)"><rect x="300" y="700" width="120" height="90"/><rect x="470" y="730" width="90" height="70"/><rect x="1020" y="690" width="140" height="100"/></g><g fill="rgb(176,78,64)"><path d="M290 700 L360 640 L430 700Z"/><path d="M460 730 L515 685 L570 730Z"/><path d="M1010 690 L1090 620 L1170 690Z"/></g><g fill="rgb(40,60,52)"><rect x="880" y="690" width="14" height="70"/><circle cx="887" cy="672" r="42"/><rect x="1300" y="710" width="14" height="70"/><circle cx="1307" cy="692" r="38"/></g><text x="800" y="940" font-family="sans-serif" font-size="64" text-anchor="middle" fill="rgb(255,255,255)">GOLDEN HOUR</text></svg>`
)}`

export default function ImageCropperAvatar() {
  const [src, setSrc] = React.useState(scene)
  const [avatar, setAvatar] = React.useState<string | null>(null)
  const cropper = React.useRef<ImageCropperHandle>(null)
  const input = React.useRef<HTMLInputElement>(null)
  // a picture chosen from the device is shown through an object URL, and given back when it is replaced
  React.useEffect(() => () => void (src.startsWith("blob:") && URL.revokeObjectURL(src)), [src])
  React.useEffect(() => () => void (avatar && URL.revokeObjectURL(avatar)), [avatar])
  return (
    <div className="grid w-full max-w-md gap-3">
      <ImageCropper cropperRef={cropper} src={src} shape="round" aspect={1} alt="Crop your profile picture" height={280} />
      <div className="flex items-center gap-3">
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label="Choose a picture"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) setSrc(URL.createObjectURL(file))
          }}
        />
        <Button type="button" variant="outline" onClick={() => input.current?.click()}>
          <Upload aria-hidden="true" />
          Choose a picture
        </Button>
        <Button type="button" onClick={async () => setAvatar(URL.createObjectURL((await cropper.current?.toBlob({ width: 256, type: "image/png" }))!))}>
          Use as avatar
        </Button>
        {avatar ? <img src={avatar} alt="Your new profile picture" className="ms-auto size-12 rounded-full border" /> : null}
      </div>
    </div>
  )
}
