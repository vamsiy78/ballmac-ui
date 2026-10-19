import { QRCode } from "@/components/ballmac/qr-code"

export default function QRCodeError() {
  return <QRCode value={"https://example.com/a-link-that-is-far-too-long?".repeat(160)} size={200} />
}
