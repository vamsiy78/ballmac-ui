import { BlogPost1 } from "@/components/ballmac/blocks/blog-post-1/blog-post-1"

export default function BlogPost1Short() {
  return (
    <BlogPost1
      category="Engineering"
      title="Why we stopped writing our own date picker"
      subtitle="A short note on build versus buy, and the one rule that settled it."
      date="2026-09-12"
      readMinutes={4}
      author="Amara Singh"
      role="Staff Engineer"
      authorBio="Amara works on the platform team and writes about the unglamorous parts of software."
      cover={2}
      related={[]}
      toc={[
        { id: "context", title: "Context", level: 2 },
        { id: "the-rule", title: "The rule", level: 2 },
      ]}
    >
      <h2 id="context">Context</h2>
      <p>Every few months someone proposes rewriting a component we already have. This time it was the date picker, and the argument was reasonable: ours is slow to localise and hard to theme.</p>
      <h2 id="the-rule">The rule</h2>
      <p>We only build what we can keep better than the alternative for the next three years. A date picker needs calendars, time zones and screen-reader behaviour that changes with every browser. We chose to adopt a well-maintained one and spend the time elsewhere.</p>
      <blockquote>If you cannot name who will maintain it in three years, you are not building it, you are adopting it.</blockquote>
    </BlogPost1>
  )
}
