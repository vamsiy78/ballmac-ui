import * as React from "react"

import { QRCode, type QRCodeLevel } from "@/components/ballmac/qr-code"

const levels: QRCodeLevel[] = ["L", "M", "Q", "H"]

export default function QRCodeLive() {
  const [ssid, setSsid] = React.useState("Studio Guest")
  const [password, setPassword] = React.useState("open-sesame-42")
  const [level, setLevel] = React.useState<QRCodeLevel>("M")
  // the standard text that phones read to join a network
  const wifi = `WIFI:T:WPA;S:${ssid};P:${password};;`
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <div className="grid w-60 gap-3 text-sm">
        <label className="grid gap-1.5 font-medium">
          Network name
          <input value={ssid} onChange={(e) => setSsid(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" />
        </label>
        <label className="grid gap-1.5 font-medium">
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" />
        </label>
        <fieldset className="grid gap-1.5">
          <legend className="font-medium">Error correction</legend>
          <div className="flex gap-1.5">
            {levels.map((l) => (
              <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(l)} className="h-8 flex-1 rounded-md border text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground">
                {l}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <QRCode value={wifi} level={level} size={176} label={`QR code to join ${ssid}`} className="border" />
    </div>
  )
}
