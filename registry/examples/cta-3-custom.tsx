import { Cta3 } from "@/components/ballmac/blocks/cta-3/cta-3"

export default function Cta3Custom() {
  return (
    <Cta3
      title="Add Acme to your app today."
      description="Install the SDK and send your first event in five lines."
      commands={{
        npm: "npm install @acme/sdk",
        pnpm: "pnpm add @acme/sdk",
        yarn: "yarn add @acme/sdk",
        bun: "bun add @acme/sdk",
      }}
      primaryAction={{ label: "Quickstart", href: "#" }}
      secondaryAction={{ label: "API reference", href: "#" }}
      notes={["TypeScript first", "4 kB gzipped", "Tree-shakeable"]}
    />
  )
}
