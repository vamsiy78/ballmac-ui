import type { Metadata } from "next"

import { CodePanel } from "@/components/site/code-panel"
import { DocsPage } from "@/components/site/docs-page"

export const metadata: Metadata = {
  title: "Using your own images",
  description: "Drop screenshots and photos into heroes, features, cards and templates with one image prop. Alt text, aspect ratios and dark-mode variants are built in.",
  alternates: { canonical: "/docs/images" },
}

export default function ImagesPage() {
  return (
    <DocsPage
      title="Using your own images"
      lead="Every hero, feature, card and template ships with generated artwork so it looks finished on day one. Pass an image and it replaces the artwork, with the right shape, loading and alt text already handled."
    >
      <h2>One prop</h2>
      <CodePanel
        lang="tsx"
        title="app/page.tsx"
        code={`import { Hero1 } from "@/components/ballmac/blocks/hero-1"

<Hero1
  media={{ src: "/shots/dashboard.png", srcDark: "/shots/dashboard-dark.png", alt: "The dashboard with this week's revenue chart" }}
/>`}
      />
      <p>
        The prop is called <code>media</code> on blocks with one big picture, and <code>image</code> on items in a list (a post, a speaker, a project).
        It accepts a URL, an object with the alt text, or your own element such as a <code>next/image</code> or a video.
      </p>
      <CodePanel
        lang="tsx"
        code={`<Hero1 media="/shots/dashboard.png" mediaAlt="The dashboard" />          // URL plus alt
<Hero1 media={{ src, srcDark, alt, width, height, position: "top" }} />  // full control
<Hero1 media={<Image src={shot} alt="The dashboard" priority fill />} />  // your own element`}
      />

      <h2>What you get</h2>
      <ul>
        <li><strong>Alt text is required.</strong> In development a missing <code>alt</code> logs a warning. Use <code>alt=&quot;&quot;</code> only for decoration.</li>
        <li><strong>No layout jump.</strong> Each slot reserves a fixed aspect ratio before the file arrives.</li>
        <li><strong>Lazy by default.</strong> Slots above the fold (hero) load right away with high priority.</li>
        <li><strong>Dark mode.</strong> <code>srcDark</code> swaps the file when an ancestor has the <code>dark</code> class.</li>
        <li><strong>Never broken.</strong> If the file is missing or fails to load, the built-in artwork shows instead of a broken icon.</li>
        <li><strong>Right-to-left safe.</strong> Nothing here depends on reading direction.</li>
      </ul>

      <h2>The Media component</h2>
      <p>
        Everything above is one component, <code>Media</code>, which you can also use directly for your own layouts.
      </p>
      <CodePanel lang="bash" code={`npx shadcn@latest add @ballmac/media`} />
      <CodePanel
        lang="tsx"
        code={`import { Media } from "@/components/ballmac/media"

<Media media="/team.jpg" alt="The team at the 2026 offsite" aspect="video" frame priority />`}
      />
      <p>
        <code>aspect</code> takes <code>square</code>, <code>video</code>, <code>photo</code>, <code>wide</code>, <code>portrait</code>, <code>cinema</code> or a ratio like{" "}
        <code>&quot;3/2&quot;</code>. <code>fit</code> is <code>cover</code>, <code>contain</code> or <code>fill</code>.
      </p>

      <h2>Where it works</h2>
      <p>
        Hero, feature and newsletter blocks, login and download screens, blog and changelog cards, the team grid, the device frames (phone, tablet, laptop,
        browser, watch, Android), the lock screen, control center, bento grid and team switcher, and the portfolio, studio, publication, podcast and goods
        templates. Each block page lists its image props.
      </p>
    </DocsPage>
  )
}
