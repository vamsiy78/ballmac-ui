import type { Metadata } from "next"

import Link from "@/components/site/link"

import { CodePanel } from "@/components/site/code-panel"
import { DocsPage } from "@/components/site/docs-page"
import { DEFAULT_MOTION, MOTION_PERSONALITIES, MOTION_RANGES } from "@ballmac-ui/theme-engine"

export const metadata: Metadata = {
  title: "Motion",
  description: "Motion is part of the theme: speed, bounce, travel, hover and stagger drive Tailwind's duration and easing classes, Ballmac's components and your own code, with a reduced-motion fallback.",
  alternates: { canonical: "/docs/motion" },
}

const SETTINGS = [
  { variable: "--bm-speed", name: "Speed", range: MOTION_RANGES.speed, value: DEFAULT_MOTION.speed, what: "Playback speed. 2 halves every duration, 0.5 doubles them." },
  { variable: "--bm-bounce", name: "Bounce", range: MOTION_RANGES.bounce, value: DEFAULT_MOTION.bounce, what: "How far springs overshoot before they settle. 0 never overshoots." },
  { variable: "--bm-travel", name: "Travel", range: MOTION_RANGES.travel, value: DEFAULT_MOTION.travel, what: "How far things move when they enter. 0 turns movement into a plain fade." },
  { variable: "--bm-hover", name: "Hover", range: MOTION_RANGES.hover, value: DEFAULT_MOTION.hover, what: "Lift on hover and depth on press." },
  { variable: "--bm-stagger", name: "Stagger", range: MOTION_RANGES.stagger, value: DEFAULT_MOTION.stagger, what: "The gap between items that enter one after another." },
  { variable: "--bm-ambient", name: "Decorative loops", range: null, value: "on", what: "Glows, shimmers and drifting backgrounds. Off holds them still." },
]

export default function MotionPage() {
  return (
    <DocsPage
      title="Motion"
      lead="A theme is colour, shape and now movement. Six settings describe how a product moves; every duration, easing, lift and stagger is derived from them."
    >
      <p>
        Try it on real components in the <Link href="/themes#motion">theme builder</Link>, or install a feel and tune it by hand.
      </p>

      <h2 id="settings">The six settings</h2>
      <p>
        Each is a CSS variable on <code>:root</code>. The defaults reproduce Ballmac UI exactly as it was, so adding the theme changes nothing until you change a setting.
      </p>
      <div className="not-prose my-4 overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[34rem] text-sm">
          <caption className="sr-only">Motion settings, their variables, ranges and defaults</caption>
          <thead>
            <tr className="bg-muted/50 text-muted-foreground text-left text-xs">
              <th scope="col" className="px-3 py-2 font-medium">Setting</th>
              <th scope="col" className="px-3 py-2 font-medium">Variable</th>
              <th scope="col" className="px-3 py-2 font-medium">Range</th>
              <th scope="col" className="px-3 py-2 font-medium">Default</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {SETTINGS.map((s) => (
              <tr key={s.variable}>
                <th scope="row" className="px-3 py-2 text-left align-top font-medium">
                  {s.name}
                  <span className="text-muted-foreground block text-xs font-normal">{s.what}</span>
                </th>
                <td className="px-3 py-2 align-top"><code>{s.variable}</code></td>
                <td className="px-3 py-2 align-top tabular-nums">{s.range ? `${s.range.min} to ${s.range.max}` : "1 or 0"}</td>
                <td className="px-3 py-2 align-top tabular-nums">{String(s.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="feels">Five ready-made feels</h2>
      <p>Each is a registry theme that changes movement only and leaves your colours alone. Installing another replaces it.</p>
      <ul>
        {MOTION_PERSONALITIES.map((p) => (
          <li key={p.slug}>
            <strong>{p.title}</strong>: {p.description} <code>@ballmac/motion-{p.slug}</code>
          </li>
        ))}
      </ul>
      <CodePanel lang="bash" code={`npx shadcn@latest add @ballmac/motion-calm`} />
      <p>
        The twelve colour themes each carry a feel that suits them (Graphite and Mono are snappy, Sand, Forest and Midnight are calm, Violet and Ember are playful), so installing{" "}
        <code>@ballmac/theme-violet</code> brings its motion too.
      </p>

      <h2 id="follows">What follows automatically</h2>
      <p>The theme rewrites Tailwind&apos;s own scales, so code you already have follows without edits:</p>
      <ul>
        <li>
          <code>duration-75</code> to <code>duration-1000</code> and <code>delay-75</code> to <code>delay-1000</code> are divided by the speed.
        </li>
        <li>
          <code>ease-out</code>, <code>ease-in</code> and <code>ease-in-out</code> use Ballmac&apos;s curves, and <code>ease-spring</code> is a new class: a real spring, written as a CSS <code>linear()</code> easing from the bounce setting. A browser that cannot parse <code>linear()</code> ignores it and keeps the previous easing.
        </li>
        <li>
          Dialogs, popovers, menus, tooltips and accordions: the enter and exit animations from <code>tw-animate-css</code> (<code>animate-in</code>, <code>animate-out</code>, the accordion and collapsible animations) take their default duration from the speed.
        </li>
        <li>Every Ballmac component: transitions, hover lift, button press, and decorative loops.</li>
        <li>
          <Link href="/docs/theming#motion-tokens">The shared motion presets</Link> (<code>spring</code>, <code>duration</code>, <code>ease</code>, <code>variants</code>, <code>stagger</code>) that Motion-based components use.
        </li>
      </ul>

      <h2 id="css">In your own CSS</h2>
      <CodePanel
        lang="css"
        title="Your CSS"
        code={`.card {
  transition: transform var(--bm-duration-base) var(--bm-ease-out);
}
.card:hover {
  transform: translateY(var(--bm-lift));      /* -2px at hover 1, 0 at hover 0 */
}
.card:active {
  transform: scale(var(--bm-press));          /* 0.97 at hover 1 */
}
.toast {
  transform: translateY(var(--bm-distance));  /* enter distance, 10px at travel 1 */
  transition: transform var(--bm-duration-slow) var(--bm-ease-spring);
}
.list > * {
  transition-delay: calc(var(--i) * var(--bm-stagger-step));
}
.glow {
  animation: pulse 2s infinite;
  animation-play-state: var(--bm-ambient-state);  /* running or paused */
}`}
      />

      <h2 id="js">In JavaScript</h2>
      <p>
        <code>@ballmac/motion-presets</code> reads the same variables. Import the constants for one-off values, or call <code>useMotion()</code> when a component should follow the theme live.
      </p>
      <CodePanel
        lang="tsx"
        title="components/toast.tsx"
        code={`import { motion } from "motion/react"
import { useLoopsPaused, useMotion } from "@/lib/ballmac/motion"

export function Toast({ children }: { children: React.ReactNode }) {
  const m = useMotion()
  return (
    <motion.div
      initial={{ opacity: 0, y: m.distance }}
      animate={{ opacity: 1, y: 0 }}
      transition={m.spring.snappy}
    >
      {children}
    </motion.div>
  )
}

// Decorative loops hold still when the theme turns them off, or under reduced motion.
function Glow() {
  const still = useLoopsPaused()
  return <motion.span animate={still ? undefined : { opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
}`}
      />
      <p>
        Spinners and &quot;thinking&quot; indicators carry meaning, so they should keep running; only decorative loops use <code>useLoopsPaused</code>.
      </p>

      <h2 id="reduced">Reduced motion</h2>
      <p>
        The theme includes a <code>prefers-reduced-motion</code> rule: no travel, no lift, no bounce, no loops, and everything a little faster. Fades remain, because a change of state must stay visible. Reduced motion is not no motion.
      </p>
      <p>
        <strong>Still</strong> ships those reduced values to every visitor, for products that should hold perfectly still. In the builder, <em>Preview reduced motion</em> shows exactly what a visitor with the setting sees.
      </p>

      <h2 id="links">Links and install URLs</h2>
      <p>
        A feel has a short address, and any combination is a link. Nothing is stored.
      </p>
      <CodePanel
        lang="bash"
        code={`# a ready-made feel
https://ui.ballmac.com/themes?mo=playful

# or any values: speed, bounce, travel, hover, stagger, ambient (1 or 0), reduce (system or always)
https://ui.ballmac.com/themes?sp=1.3&bn=0.6&tv=0.8&hv=1.2&st=0.5&am=0

# install a custom design, colour and motion together
npx shadcn@latest add "https://ui.ballmac.com/themes/custom.json?h=262&mo=calm"`}
      />
      <p>Every value is clamped to its range, so a link can never produce an unsafe theme.</p>
    </DocsPage>
  )
}
