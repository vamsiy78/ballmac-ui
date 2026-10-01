import { CopyButton } from "@/components/ballmac/copy-button"

export default function CopyButtonDemo() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <CopyButton value="pnpm add @acme/ui" ariaLabel="Copy install command" />
        <CopyButton variant="outline" label="Copy" value="pnpm add @acme/ui" />
        <CopyButton variant="solid" label="Copy link" copiedLabel="Link copied" value="https://example.com/docs" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <CopyButton size="sm" variant="outline" ariaLabel="Copy small" value="small" />
        <CopyButton size="default" variant="outline" ariaLabel="Copy default" value="default" />
        <CopyButton size="lg" variant="outline" ariaLabel="Copy large" value="large" />
      </div>
    </div>
  )
}
