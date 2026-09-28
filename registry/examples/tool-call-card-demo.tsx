import { ToolCallCard } from "@/components/ballmac/tool-call-card"

export default function ToolCallCardDemo() {
  return (
    <div className="w-full max-w-xl">
      <ToolCallCard
        name="search_docs"
        description="Searched the documentation"
        status="success"
        duration={842}
        defaultOpen
        input={{ query: "install a component into a src/ project", limit: 3 }}
        result={[
          { title: "Installation", url: "/docs/installation" },
          { title: "CLI & registry", url: "/docs/registry" },
        ]}
      />
    </div>
  )
}
