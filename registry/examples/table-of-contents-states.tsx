"use client";
import { TableOfContents } from "@/components/ballmac/table-of-contents";
export default function TableOfContentsStates() {
  return (
    <div className="w-56 rounded-xl border bg-card p-4">
      <TableOfContents
        title="In this guide"
        items={[
          { id: "intro", title: "Introduction", level: 2 },
          { id: "setup", title: "Setup", level: 2 },
          { id: "setup-env", title: "Environment", level: 3 },
          { id: "setup-keys", title: "API keys", level: 3 },
          { id: "deploy", title: "Deploy", level: 2 },
        ]}
      />
    </div>
  );
}
