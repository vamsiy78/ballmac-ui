import { LedgerDownload } from "@/components/ballmac/templates/ledger/ledger-download"

export default function TemplateLedgerDownload() {
  return (
    <LedgerDownload
      hrefs={{ home: "/preview/template-ledger-demo", download: "/preview/template-ledger-download", pricing: "/preview/template-ledger-pricing", changelog: "/preview/template-ledger-changelog", support: "/preview/template-ledger-support" }}
    />
  )
}
