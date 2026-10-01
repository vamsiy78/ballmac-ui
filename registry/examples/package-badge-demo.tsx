import { PackageBadge } from "@/components/ballmac/package-badge"

export default function PackageBadgeDemo() {
  return (
    <div className="w-full max-w-lg">
      <PackageBadge
        name="@acme/ui"
        version="2.4.1"
        href="https://example.com/packages/acme-ui"
        description="Accessible React components with a built-in design token system and zero runtime CSS."
        downloads={482_300}
        trend={[310, 322, 318, 340, 366, 372, 401, 389, 432, 455, 470, 482]}
        size={18_432}
        license="MIT"
        types
        formats={["ESM", "CJS"]}
        manager="pnpm"
      />
    </div>
  )
}
