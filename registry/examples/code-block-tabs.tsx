import { CodeBlockTabs } from "@/components/ballmac/code-block"

const files = [
  {
    filename: "app/page.tsx",
    language: "tsx",
    code: `import { Hero } from "@/components/hero"\n\nexport default function Page() {\n  return <Hero />\n}`,
  },
  {
    filename: "components.json",
    language: "json",
    code: `{\n  "registries": {\n    "@ballmac": "https://ui.ballmac.com/r/{name}.json"\n  }\n}`,
  },
]

export default function CodeBlockTabsDemo() {
  return <CodeBlockTabs className="w-full max-w-xl" files={files} lineNumbers />
}
