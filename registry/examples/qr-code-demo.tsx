"use client"

import * as React from "react"
import { Download } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { downloadQRCode, QRCode } from "@/components/ballmac/qr-code"

export default function QRCodeDemo() {
  const svg = React.useRef<SVGSVGElement>(null)
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-2xl border bg-card p-3 shadow-xs">
        <QRCode value="https://ui.ballmac.com/components/qr-code" size={200} svgRef={svg} />
      </div>
      <p className="max-w-52 text-center text-sm text-muted-foreground">Point a phone camera at it to open the page.</p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => svg.current && downloadQRCode(svg.current, { filename: "ballmac-qr", format: "png" })}>
          <Download aria-hidden="true" />
          PNG
        </Button>
        <Button size="sm" variant="outline" onClick={() => svg.current && downloadQRCode(svg.current, { filename: "ballmac-qr", format: "svg" })}>
          <Download aria-hidden="true" />
          SVG
        </Button>
      </div>
    </div>
  )
}
