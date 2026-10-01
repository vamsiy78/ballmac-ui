import { Blog1 } from "@/components/ballmac/blocks/blog-1/blog-1"

export default function Blog1Compact() {
  return (
    <Blog1
      eyebrow="Engineering"
      title="Notes from the build."
      description="Short write-ups from the people who ship the product."
      filterable={false}
      posts={[
        { title: "Shaving 400 ms off every page with streaming", excerpt: "How we moved to streamed server rendering without breaking a single cache.", category: "Engineering", date: "2026-09-20", readMinutes: 7, author: "Marcus Webb", href: "#", cover: 4 },
        { title: "Our approach to feature flags", excerpt: "Small, boring and well-documented beats clever every time.", category: "Engineering", date: "2026-09-02", readMinutes: 5, author: "Amara Singh", href: "#", cover: 2 },
        { title: "Postmortem: the slow Tuesday", excerpt: "A queue, a retry storm and the three fixes that followed.", category: "Engineering", date: "2026-08-14", readMinutes: 10, author: "Marcus Webb", href: "#", cover: 1 },
      ]}
    />
  )
}
