import { PackageBadge } from "@/components/ballmac/package-badge"

export default function PackageBadgeInline() {
  return (
    <div className="flex w-full max-w-lg flex-wrap items-center gap-2">
      <PackageBadge variant="inline" name="@acme/ui" version="2.4.1" downloads={482_300} />
      <PackageBadge variant="inline" name="acme-cli" version="0.18.0" downloads={12_900} />
      <PackageBadge variant="inline" name="@acme/icons" version="1.2.0" />
    </div>
  )
}
