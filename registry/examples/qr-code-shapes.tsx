"use client"

import { QRCode, type QRCodeShape } from "@/components/ballmac/qr-code"

const shapes: { shape: QRCodeShape; name: string }[] = [
  { shape: "square", name: "Square" },
  { shape: "rounded", name: "Rounded" },
  { shape: "dots", name: "Dots" },
]

export default function QRCodeShapes() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-6">
      {shapes.map(({ shape, name }) => (
        <figure key={shape} className="flex flex-col items-center gap-2">
          <div className="rounded-xl border p-2">
            <QRCode value="https://ui.ballmac.com" shape={shape} size={136} level="Q" />
          </div>
          <figcaption className="text-sm text-muted-foreground">{name}</figcaption>
        </figure>
      ))}
    </div>
  )
}
