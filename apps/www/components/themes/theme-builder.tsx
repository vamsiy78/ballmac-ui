"use client"

import * as React from "react"
import { Check, Copy, Dices, Link2, Moon, RotateCcw, Sun, SquareSplitHorizontal } from "lucide-react"
import {
  auditTheme,
  buildTheme,
  DEFAULT_SPEC,
  decodeSpec,
  encodeSpec,
  feelSpec,
  FEELS,
  matchPersonality,
  MOTION_PERSONALITIES,
  MOTION_RANGES,
  normalizeSpec,
  PRESETS,
  SPEC_PARAMS,
  themeCss,
  themeRegistryItem,
  type Density,
  type FontChoice,
  type ThemeSpec,
} from "@ballmac-ui/theme-engine"

import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Switch } from "@/components/ballmac/switch"
import { CopyButton } from "@/components/site/copy-button"
import { InstallTabs } from "@/components/site/install-tabs"
import { themeUrl } from "@/lib/theme-url"
import { cn } from "@/lib/utils"

import { FeelCompare } from "./feel-compare"
import { MotionLab } from "./motion-lab"
import { PresetMini } from "./preset-card"
import { Group, RangeField, Row } from "./theme-controls"
import { ThemeStage } from "./theme-stage"
import { type Mode } from "./theme-style"

type View = "light" | "dark" | "split"

const subscribeNever = () => () => {}
const subscribeReduced = (cb: () => void) => {
  const q = window.matchMedia("(prefers-reduced-motion: reduce)")
  q.addEventListener("change", cb)
  return () => q.removeEventListener("change", cb)
}
const fmtX = (n: number) => `${n.toFixed(2).replace(/\.?0+$/, "")}×`
const pct = (n: number) => `${Math.round(n * 100)}%`
const same = (a: ThemeSpec, b: ThemeSpec) => (Object.keys(a) as (keyof ThemeSpec)[]).every((k) => a[k] === b[k])
const hueTrack = `linear-gradient(to right, ${Array.from({ length: 13 }, (_, i) => `oklch(0.72 0.15 ${i * 30})`).join(", ")})`
const RADII = [
  { label: "Square", value: 0 },
  { label: "Soft", value: 0.5 },
  { label: "Round", value: 0.875 },
  { label: "Pill", value: 1.25 },
]

function copyToClipboard(text: string) {
  return navigator.clipboard.writeText(text).then(() => true, () => false)
}

/** Live theme builder: pick a preset, adjust a few controls, see real components change, copy CSS or install. */
export function ThemeBuilder({ initial, presetSlug, siteUrl }: { initial: ThemeSpec; presetSlug?: string; siteUrl: string }) {
  // The address bar and the site's colour scheme are read through a store, so the server HTML is the same for everyone and the client adopts them after hydration.
  const search = React.useSyncExternalStore(subscribeNever, () => window.location.search, () => "")
  const siteDark = React.useSyncExternalStore(subscribeNever, () => document.documentElement.classList.contains("dark"), () => false)
  const params = React.useMemo(() => new URLSearchParams(search), [search])
  const fromUrl = React.useMemo(() => ([...params.keys()].some((k) => SPEC_PARAMS.has(k)) ? decodeSpec(params, DEFAULT_SPEC) : null), [params])
  const osReduced = React.useSyncExternalStore(subscribeReduced, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => false)
  const [reducePreview, setReducePreview] = React.useState(false)
  const [edited, setEdited] = React.useState<ThemeSpec | null>(null)
  const [viewEdit, setViewEdit] = React.useState<View | null>(null)
  const [linkEdit, setLinkEdit] = React.useState<boolean | null>(null)
  const [shared, setShared] = React.useState(false)
  const baseId = React.useId().replace(/:/g, "")

  const spec = edited ?? fromUrl ?? initial
  const urlView = params.get("view")
  const view: View = viewEdit ?? (urlView === "dark" || urlView === "split" || urlView === "light" ? urlView : siteDark ? "dark" : "light")
  const linkNeutral = linkEdit ?? Math.abs(spec.neutralHue - spec.hue) <= 20
  const setView = setViewEdit
  const setSpec = setEdited
  const setLinkNeutral = setLinkEdit

  // Keep the address bar in step with the design, so the URL is always a shareable link. replaceState, not pushState: a slider drag would otherwise add dozens of history entries.
  const basePath = presetSlug ? `/themes/${presetSlug}` : "/themes"
  React.useEffect(() => {
    if (!edited && !viewEdit) return
    window.history.replaceState(null, "", themeUrl({ spec, view, initial, basePath }))
  }, [edited, viewEdit, spec, view, initial, basePath])

  const update = (patch: Partial<ThemeSpec>) => setSpec(normalizeSpec({ ...spec, ...patch, ...(linkNeutral && patch.hue !== undefined ? { neutralHue: patch.hue } : {}) }))
  const choose = (next: ThemeSpec) => {
    setSpec(next)
    setLinkNeutral(null)
  }
  const matched = PRESETS.find((p) => same(p.spec, spec))
  const base = PRESETS.find((p) => p.slug === presetSlug)
  const vars = React.useMemo(() => buildTheme(spec), [spec])
  const checks = React.useMemo(() => auditTheme(vars), [vars])
  const failing = checks.filter((c) => !c.pass)
  const css = React.useMemo(() => themeCss(spec), [spec])
  const personality = matchPersonality(spec)
  const previewReduced = reducePreview || osReduced
  const modes: Mode[] = view === "split" ? ["light", "dark"] : [view]
  const previewMode: Mode = view === "dark" ? "dark" : "light"

  const surprise = () => {
    const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)]!
    const hue = Math.round(Math.random() * 360)
    choose(
      normalizeSpec({
        hue,
        neutralHue: hue,
        chroma: 0.1 + Math.random() * 0.12,
        neutralChroma: pick([0.002, 0.006, 0.01]),
        radius: pick([0, 0.375, 0.5, 0.75, 1]),
        primary: pick(["brand", "ink"] as const),
        paper: Math.random() < 0.25,
        edge: Math.random() < 0.2 ? "strong" : "soft",
        ...pick(MOTION_PERSONALITIES).motion,
      })
    )
  }

  const installUrl = `${siteUrl}/themes/custom.json?${encodeSpec(spec).toString() || "h=" + spec.hue}`
  const commands = (matched ? `@ballmac/theme-${matched.slug}` : `"${installUrl}"`)
  const installCommands = {
    pnpm: `pnpm dlx shadcn@latest add ${commands}`,
    npm: `npx shadcn@latest add ${commands}`,
    yarn: `yarn dlx shadcn@latest add ${commands}`,
    bun: `bunx --bun shadcn@latest add ${commands}`,
  }
  const registryJson = JSON.stringify(
    themeRegistryItem(spec, { name: matched ? `theme-${matched.slug}` : "theme-custom", title: matched ? `${matched.title} theme` : "Custom theme", description: matched?.description ?? "A custom Ballmac UI theme." }),
    null,
    2
  )
  const [exportTab, setExportTab] = React.useState<"css" | "json" | "install">("install")
  const exportText = exportTab === "css" ? css : exportTab === "json" ? registryJson : ""

  return (
    <div className="space-y-12">
      <section aria-labelledby={`${baseId}-presets`} className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id={`${baseId}-presets`} className="text-xl font-semibold tracking-tight">
              Start from a preset
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">Twelve themes, each checked for contrast in light and dark. Pick one, then make it yours below.</p>
          </div>
          <button
            type="button"
            onClick={surprise}
            className="hover:bg-accent focus-visible:ring-ring/50 inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium outline-none focus-visible:ring-[3px]"
          >
            <Dices className="size-4" aria-hidden="true" /> Surprise me
          </button>
        </div>
        <div role="group" aria-label="Theme presets" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {PRESETS.map((p) => {
            const selected = matched?.slug === p.slug
            return (
              <button
                key={p.slug}
                type="button"
                aria-pressed={selected}
                onClick={() => choose(p.spec)}
                className={cn(
                  "focus-visible:ring-ring/50 group grid gap-2.5 rounded-2xl border p-2 text-left outline-none transition-[border-color,box-shadow] focus-visible:ring-[3px]",
                  selected ? "border-foreground shadow-sm ring-1 ring-foreground" : "hover:border-foreground/30"
                )}
              >
                <PresetMini spec={p.spec} mode={previewMode} />
                <span className="px-1 pb-1">
                  <span className="flex items-center justify-between gap-2 text-sm font-medium">
                    {p.title}
                    {selected && <Check className="size-4" aria-label="Selected" />}
                  </span>
                  <span className="text-muted-foreground mt-0.5 block text-xs leading-snug">{p.tagline}</span>
                  <span className="text-muted-foreground/80 mt-0.5 block text-[11px] leading-snug capitalize">{p.motion} motion</span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section aria-labelledby={`${baseId}-build`} className="grid items-start gap-6 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <h2 id={`${baseId}-build`} className="sr-only">
          Customise
        </h2>
        <div className="bg-card grid gap-6 rounded-2xl border p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">{matched ? matched.title : base ? `${base.title}, customised` : "Custom theme"}</p>
            <button
              type="button"
              onClick={() => choose(initial)}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs outline-none focus-visible:ring-[3px]"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" /> Reset
            </button>
          </div>

          <Group title="Platform feel">
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Platform feel">
              {FEELS.map((f) => (
                <button
                  key={f.slug}
                  type="button"
                  aria-pressed={spec.feel === f.slug}
                  onClick={() => update(feelSpec(f.slug))}
                  className={cn(
                    "focus-visible:ring-ring/50 grid gap-0.5 rounded-lg border p-2.5 text-left outline-none focus-visible:ring-[3px]",
                    spec.feel === f.slug ? "border-foreground ring-foreground ring-1" : "hover:border-foreground/30"
                  )}
                >
                  <span className="flex items-center justify-between gap-2 text-sm font-medium">
                    {f.title}
                    {spec.feel === f.slug && <Check className="size-3.5" aria-label="Selected" />}
                  </span>
                  <span className="text-muted-foreground text-xs leading-snug">{f.tagline}</span>
                </button>
              ))}
            </div>
            <p className="text-muted-foreground -mt-2 text-xs">
              A feel sets radius, density, font, motion, focus ring, shadows, text and control sizes together. Change any of them below afterwards.
            </p>
            {spec.feel !== "web" && (
              <p className="text-muted-foreground text-xs">
                Only the feel, keeping your colours: <code className="bg-muted rounded px-1 py-0.5 font-mono text-[0.9em]">@ballmac/feel-{spec.feel}</code>
              </p>
            )}
          </Group>

          <Group title="Colour">
            <RangeField label="Brand hue" value={spec.hue} min={0} max={360} step={1} display={`${Math.round(spec.hue)}°`} valueText={`${Math.round(spec.hue)} degrees`} track={hueTrack} onChange={(hue) => update({ hue })} />
            <RangeField
              label="Intensity"
              value={spec.chroma}
              min={0}
              max={0.26}
              step={0.005}
              display={spec.chroma < 0.02 ? "Grey" : `${Math.round((spec.chroma / 0.26) * 100)}%`}
              track={`linear-gradient(to right, oklch(0.72 0 ${spec.hue}), oklch(0.72 0.22 ${spec.hue}))`}
              onChange={(chroma) => update({ chroma })}
            />
            <Row label="Buttons" hint={spec.primary === "brand" ? "Buttons take the brand colour." : "Buttons are ink; the brand colour is used for focus, charts and accents."}>
              <SegmentedControl aria-label="Buttons" fullWidth value={spec.primary} onValueChange={(v) => update({ primary: v as ThemeSpec["primary"] })}>
                <SegmentedControlItem value="brand">Brand</SegmentedControlItem>
                <SegmentedControlItem value="ink">Ink</SegmentedControlItem>
              </SegmentedControl>
            </Row>
            <RangeField
              label="Grey tint"
              value={spec.neutralChroma}
              min={0}
              max={0.03}
              step={0.001}
              display={spec.neutralChroma === 0 ? "None" : `${Math.round((spec.neutralChroma / 0.03) * 100)}%`}
              track={`linear-gradient(to right, oklch(0.9 0 ${spec.neutralHue}), oklch(0.9 0.03 ${spec.neutralHue}))`}
              onChange={(neutralChroma) => update({ neutralChroma })}
            />
            <div className="flex items-center justify-between gap-3">
              <label htmlFor={`${baseId}-link`} className="text-sm">
                Tint greys with the brand hue
              </label>
              <Switch
                id={`${baseId}-link`}
                checked={linkNeutral}
                onCheckedChange={(on) => {
                  setLinkNeutral(on)
                  if (on) update({ neutralHue: spec.hue })
                }}
              />
            </div>
            {!linkNeutral && (
              <RangeField label="Grey hue" value={spec.neutralHue} min={0} max={360} step={1} display={`${Math.round(spec.neutralHue)}°`} track={hueTrack} onChange={(neutralHue) => update({ neutralHue })} />
            )}
            <Row label="Page">
              <SegmentedControl aria-label="Page colour" fullWidth value={spec.paper ? "paper" : "white"} onValueChange={(v) => update({ paper: v === "paper" })}>
                <SegmentedControlItem value="white">White</SegmentedControlItem>
                <SegmentedControlItem value="paper">Paper</SegmentedControlItem>
              </SegmentedControl>
            </Row>
          </Group>

          <Group title="Shape">
            <RangeField label="Corner radius" value={spec.radius} min={0} max={1.5} step={0.025} display={`${spec.radius}rem`} valueText={`${spec.radius} rem`} onChange={(radius) => update({ radius })} />
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Radius shortcuts">
              {RADII.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  aria-pressed={spec.radius === r.value}
                  onClick={() => update({ radius: r.value })}
                  className={cn(
                    "focus-visible:ring-ring/50 rounded-md border px-2.5 py-1 text-xs outline-none focus-visible:ring-[3px]",
                    spec.radius === r.value ? "bg-foreground text-background border-foreground" : "hover:bg-accent"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <Row label="Density" hint="Scales every gap and padding.">
              <SegmentedControl aria-label="Density" fullWidth value={spec.density} onValueChange={(v) => update({ density: v as Density })}>
                <SegmentedControlItem value="compact">Compact</SegmentedControlItem>
                <SegmentedControlItem value="default">Default</SegmentedControlItem>
                <SegmentedControlItem value="comfortable">Roomy</SegmentedControlItem>
              </SegmentedControl>
            </Row>
            <Row label="Borders" hint={spec.edge === "strong" ? "Outlines reach 3:1 contrast." : undefined}>
              <SegmentedControl aria-label="Borders" fullWidth value={spec.edge} onValueChange={(v) => update({ edge: v as ThemeSpec["edge"] })}>
                <SegmentedControlItem value="soft">Soft</SegmentedControlItem>
                <SegmentedControlItem value="strong">Strong</SegmentedControlItem>
              </SegmentedControl>
            </Row>
          </Group>

          <Group title="Type">
            <Row label="Font" hint={spec.font === "keep" ? "Your project's font is left alone." : "Sets --font-sans to a system stack; no font files to load."}>
              <SegmentedControl aria-label="Font" fullWidth value={spec.font} onValueChange={(v) => update({ font: v as FontChoice })}>
                <SegmentedControlItem value="keep">Keep</SegmentedControlItem>
                <SegmentedControlItem value="system">Sans</SegmentedControlItem>
                <SegmentedControlItem value="serif">Serif</SegmentedControlItem>
                <SegmentedControlItem value="mono">Mono</SegmentedControlItem>
              </SegmentedControl>
            </Row>
          </Group>

          <Group title="Motion">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Motion personality">
              {MOTION_PERSONALITIES.map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  aria-pressed={personality?.slug === p.slug}
                  title={p.tagline}
                  onClick={() => update(p.motion)}
                  className={cn(
                    "focus-visible:ring-ring/50 rounded-md border px-2.5 py-1 text-xs outline-none focus-visible:ring-[3px]",
                    personality?.slug === p.slug ? "bg-foreground text-background border-foreground" : "hover:bg-accent"
                  )}
                >
                  {p.title}
                </button>
              ))}
            </div>
            <p className="text-muted-foreground -mt-2 text-xs">{personality ? personality.tagline : "Custom: a mix of the settings below."}</p>
            <RangeField label="Speed" value={spec.speed} {...MOTION_RANGES.speed} display={fmtX(spec.speed)} valueText={`${fmtX(spec.speed)} speed`} onChange={(speed) => update({ speed })} />
            <RangeField label="Bounce" value={spec.bounce} {...MOTION_RANGES.bounce} display={pct(spec.bounce)} onChange={(bounce) => update({ bounce })} hint="How far springs overshoot before they settle." />
            <RangeField label="Travel" value={spec.travel} {...MOTION_RANGES.travel} display={fmtX(spec.travel)} onChange={(travel) => update({ travel })} hint="How far things move when they enter." />
            <RangeField label="Hover" value={spec.hover} {...MOTION_RANGES.hover} display={fmtX(spec.hover)} onChange={(hover) => update({ hover })} hint="Lift on hover and depth on press." />
            <RangeField label="Stagger" value={spec.stagger} {...MOTION_RANGES.stagger} display={fmtX(spec.stagger)} onChange={(stagger) => update({ stagger })} hint="The gap between items that enter one after another." />
            <div className="flex items-center justify-between gap-3">
              <label htmlFor={`${baseId}-ambient`} className="text-sm">
                Decorative loops
              </label>
              <Switch id={`${baseId}-ambient`} checked={spec.ambient} onCheckedChange={(ambient) => update({ ambient })} />
            </div>
            <Row label="Reduced motion" hint={spec.reduce === "always" ? "Every visitor gets the reduced values." : "Visitors who ask for less motion get no travel, lift, bounce or loops. Fades stay."}>
              <SegmentedControl aria-label="Reduced motion" fullWidth value={spec.reduce} onValueChange={(v) => update({ reduce: v as ThemeSpec["reduce"] })}>
                <SegmentedControlItem value="system">Follow system</SegmentedControlItem>
                <SegmentedControlItem value="always">Always</SegmentedControlItem>
              </SegmentedControl>
            </Row>
            <p className="text-muted-foreground text-xs">
              Your own components follow too: Tailwind&apos;s <code className="bg-muted rounded px-1 py-0.5 font-mono text-[0.9em]">duration-*</code> and <code className="bg-muted rounded px-1 py-0.5 font-mono text-[0.9em]">ease-*</code> classes read these tokens.
            </p>
          </Group>
        </div>

        <div className="min-w-0 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SegmentedControl aria-label="Preview mode" value={view} onValueChange={(v) => setView(v as View)}>
              <SegmentedControlItem value="light" aria-label="Light">
                <Sun className="size-3.5" aria-hidden="true" /> Light
              </SegmentedControlItem>
              <SegmentedControlItem value="dark" aria-label="Dark">
                <Moon className="size-3.5" aria-hidden="true" /> Dark
              </SegmentedControlItem>
              <SegmentedControlItem value="split" aria-label="Light and dark side by side">
                <SquareSplitHorizontal className="size-3.5" aria-hidden="true" /> Both
              </SegmentedControlItem>
            </SegmentedControl>
            <button
              type="button"
              onClick={async () => {
                if (await copyToClipboard(window.location.href)) {
                  setShared(true)
                  setTimeout(() => setShared(false), 1800)
                }
              }}
              aria-describedby={`${baseId}-link-hint`}
              className="hover:bg-accent focus-visible:ring-ring/50 inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-[13px] font-medium outline-none focus-visible:ring-[3px]"
            >
              {shared ? <Check className="size-3.5" aria-hidden="true" /> : <Link2 className="size-3.5" aria-hidden="true" />}
              {shared ? "Link copied" : "Copy link to this theme"}
            </button>
            <span role="status" className="sr-only">
              {shared ? "Link copied to the clipboard" : ""}
            </span>
          </div>
          <p id={`${baseId}-link-hint`} className="text-muted-foreground -mt-2 text-xs">
            Your design is saved in the address bar, not on our servers. Copy the link to share this exact theme.
          </p>

          <div className={cn("grid gap-4", view === "split" && "2xl:grid-cols-2")}>
            {modes.map((m) => (
              <div key={m} className="overflow-hidden rounded-2xl border shadow-sm">
                <div className="bg-muted/50 flex items-center justify-between border-b px-4 py-2 text-xs">
                  <span className="text-muted-foreground font-medium">{m === "light" ? "Light" : "Dark"} preview</span>
                  <span className="text-muted-foreground">Real Ballmac components</span>
                </div>
                <ThemeStage spec={spec} mode={m} id={`${baseId}-${m}`} reduced={previewReduced} />
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">Menus and dialogs open outside the preview, so they are left out. In your app they follow the same tokens.</p>
        </div>
      </section>


      <section id="motion" aria-labelledby={`${baseId}-motion`} className="scroll-mt-24 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id={`${baseId}-motion`} className="text-xl font-semibold tracking-tight">
              Feel the motion
            </h2>
            <p className="text-muted-foreground mt-1 max-w-2xl text-sm">Hover, press and replay. Every panel reads the tokens your settings produce, so what you feel here is what your components do.</p>
          </div>
          <div className="flex items-center gap-2.5">
            <label htmlFor={`${baseId}-reduce-preview`} className="text-sm">
              Preview reduced motion
            </label>
            <Switch id={`${baseId}-reduce-preview`} checked={previewReduced} disabled={osReduced} onCheckedChange={setReducePreview} />
          </div>
        </div>
        {osReduced && <p className="text-muted-foreground text-xs">Your system asks for reduced motion, so this preview already shows it.</p>}
        <div className={cn("grid gap-4", view === "split" && "2xl:grid-cols-2")}>
          {modes.map((m) => (
            <div key={m} className="overflow-hidden rounded-2xl border shadow-sm">
              <MotionLab spec={spec} mode={m} reduced={previewReduced} id={`${baseId}-lab-${m}`} />
            </div>
          ))}
        </div>
      </section>


      <section id="feels" aria-labelledby={`${baseId}-feels`} className="scroll-mt-24 space-y-4">
        <div>
          <h2 id={`${baseId}-feels`} className="text-xl font-semibold tracking-tight">
            Compare the feels
          </h2>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">The same app in your colours, once per platform feel. Only the handling changes: sizes, corners, focus, shadows, menus and window controls.</p>
        </div>
        <FeelCompare spec={spec} mode={previewMode} reduced={previewReduced} id={`${baseId}-compare`} />
        <p className="text-muted-foreground text-xs">These are web components that feel like each platform, not native controls. Ballmac UI is not affiliated with Apple or Microsoft.</p>
      </section>

      <section aria-labelledby={`${baseId}-export`} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          <h2 id={`${baseId}-export`} className="text-xl font-semibold tracking-tight">
            Use it
          </h2>
          <SegmentedControl aria-label="Export format" value={exportTab} onValueChange={(v) => setExportTab(v as typeof exportTab)}>
            <SegmentedControlItem value="install">CLI</SegmentedControlItem>
            <SegmentedControlItem value="css">CSS</SegmentedControlItem>
            <SegmentedControlItem value="json">Registry JSON</SegmentedControlItem>
          </SegmentedControl>
          {exportTab === "install" ? (
            <div className="space-y-3">
              <InstallTabs commands={installCommands} />
              <p className="text-muted-foreground text-sm leading-relaxed">
                {matched ? (
                  <>This is the {matched.title} preset, so it installs by name.</>
                ) : (
                  <>This installs your exact settings from a link; nothing is stored on our side.</>
                )}{" "}
                The command writes the tokens into your <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.85em]">globals.css</code>.
              </p>
            </div>
          ) : (
            <div className="bg-card overflow-hidden rounded-xl border">
              <div className="flex h-10 items-center justify-between border-b px-4">
                <span className="text-muted-foreground font-mono text-xs">{exportTab === "css" ? "app/globals.css" : "theme.json"}</span>
                <CopyButton value={exportText} label={`Copy ${exportTab === "css" ? "CSS" : "JSON"}`} />
              </div>
              <pre tabIndex={0} className="max-h-[420px] overflow-auto px-4 py-3.5 font-mono text-[12.5px] leading-6">
                <code>{exportText}</code>
              </pre>
            </div>
          )}
          {exportTab === "css" && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              Paste over the matching blocks in a project set up with <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.85em]">shadcn init</code>. Components read these variables only.
            </p>
          )}
        </div>

        <div className="min-w-0 space-y-4">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight">Contrast</h2>
            <p className={cn("text-sm font-medium", failing.length ? "text-destructive" : "text-foreground")}>
              {failing.length ? `${failing.length} of ${checks.length} checks fail` : `${checks.length} of ${checks.length} checks pass`}
            </p>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Every text and graphic pairing the components use, measured against WCAG: 4.5:1 for text, 3:1 for focus rings and chart colours. The builder moves lightness for you, so the result stays readable at any hue.
          </p>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[22rem] text-sm">
              <caption className="sr-only">Contrast ratios in light and dark mode</caption>
              <thead>
                <tr className="bg-muted/50 text-muted-foreground text-left text-xs">
                  <th scope="col" className="px-3 py-2 font-medium">
                    Pairing
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Light
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Dark
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Needs
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[...new Set(checks.map((c) => c.label))].map((label) => {
                  const l = checks.find((c) => c.label === label && c.mode === "light")
                  const d = checks.find((c) => c.label === label && c.mode === "dark")
                  return (
                    <tr key={label}>
                      <th scope="row" className="px-3 py-1.5 text-left font-normal">
                        {label}
                      </th>
                      {[l, d].map((c, i) => (
                        <td key={i} className="px-3 py-1.5 tabular-nums">
                          {c ? (
                            <span className={cn("inline-flex items-center gap-1.5", !c.pass && "text-destructive font-medium")}>
                              {c.ratio.toFixed(1)}:1
                              {c.pass ? <Check className="size-3.5" aria-label="Passes" /> : <span>fails</span>}
                            </span>
                          ) : null}
                        </td>
                      ))}
                      <td className="text-muted-foreground px-3 py-1.5 text-right tabular-nums">{(l ?? d)?.min}:1</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section aria-labelledby={`${baseId}-tokens`} className="space-y-4">
        <h2 id={`${baseId}-tokens`} className="text-xl font-semibold tracking-tight">
          Tokens
        </h2>
        <div className={cn("grid gap-6", view === "split" && "lg:grid-cols-2")}>
          {modes.map((m) => (
            <div key={m}>
              <p className="text-muted-foreground mb-2 text-xs font-medium">{m === "light" ? "Light" : "Dark"}</p>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                {Object.entries(vars[m])
                  .filter(([k]) => !k.endsWith("-foreground") && k !== "radius" && !k.startsWith("bm-"))
                  .map(([k, v]) => (
                    <li key={k}>
                      <TokenSwatch name={k} value={v} />
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function TokenSwatch({ name, value }: { name: string; value: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        if (await copyToClipboard(value)) {
          setCopied(true)
          setTimeout(() => setCopied(false), 1400)
        }
      }}
      aria-label={`Copy ${name}: ${value}`}
      className="focus-visible:ring-ring/50 group flex w-full items-center gap-2.5 rounded-lg border p-1.5 text-left outline-none focus-visible:ring-[3px]"
    >
      <span className="size-9 shrink-0 rounded-md border" style={{ background: value }} aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium">{name}</span>
        <span className="text-muted-foreground block truncate font-mono text-[10.5px]">{copied ? "Copied" : value}</span>
      </span>
      <Copy className="text-muted-foreground size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true" />
    </button>
  )
}
