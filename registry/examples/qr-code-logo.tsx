import { QRCode } from "@/components/ballmac/qr-code"

export default function QRCodeLogo() {
  return (
    <QRCode
      value="https://ui.ballmac.com/presets"
      size={220}
      shape="rounded"
      logo={
        <span aria-hidden="true" className="flex size-full items-center justify-center rounded-lg bg-foreground text-sm font-semibold tracking-tight text-background">
          B
        </span>
      }
      label="QR code for the Ballmac presets page"
    />
  )
}
