/**
 * Platform feel: how a product handles, apart from its colours.
 *
 * A feel is a preset over fields a theme already has (radius, density, font and the motion settings) plus tokens that only a
 * feel sets: focus ring, elevation, text scale, control and menu sizes, sidebar style, translucency, press feedback and
 * scrollbars. Picking a feel in the builder applies its preset; every field can still be changed afterwards.
 *
 * The numbers come from permissively licensed design-token and component sources (Fluent UI's tokens for Windows, Konsta UI's
 * iOS values) and from measuring the platforms. Nothing here is copied from Apple or Microsoft guidelines or assets, and
 * Ballmac UI is not affiliated with either company: these are web components that feel like the platform, not native controls.
 */
import { normalizeMotion, type MotionFields } from "./motion"

export type FeelId = "web" | "macos" | "ios" | "windows"

export type FeelFields = { feel: FeelId }

export const DEFAULT_FEEL: FeelId = "web"

export type FeelPreset = {
  slug: FeelId
  title: string
  tagline: string
  description: string
  /** What picking this feel sets on the theme. Radius is in rem. */
  spec: Partial<MotionFields> & { radius: number; density: "compact" | "default" | "comfortable"; font: "keep" | "system" }
  /** Where window controls sit in a title bar. */
  controls: "left" | "right" | "none"
  tokens: FeelTokens
}

export type FeelTokens = {
  shadow: { xs: string; sm: string; md: string; lg: string; xl: string; "2xl": string; /** Menus, popovers and hover cards. */ popover: string }
  /** Font size and line height per Tailwind text step, in rem. */
  text: { xs: [string, string]; sm: [string, string]; base: [string, string] }
  focus: { width: string; alpha: string; color: string }
  control: { h: string; hSm: string; hLg: string; target: string }
  /** Checkbox and radio box size, and the default switch track. */
  toggle: { check: string; switchW: string; switchH: string }
  /** Opacity the pressed control dims to; 1 means it does not dim. */
  pressDim: string
  material: { blur: string; alpha: string }
  sidebar: { itemH: string; itemRadius: string; indicator: string }
  menu: { itemH: string; itemRadius: string; pad: string }
  scrollbar: "auto" | "thin" | "none"
  titlebarH: string
  toolbarH: string
}

/** Tailwind's own values, so the web feel reproduces today's look exactly. */
const WEB: FeelTokens = {
  shadow: {
    xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    popover: "0 12px 36px -10px rgb(0 0 0 / 0.25)",
  },
  text: { xs: ["0.75rem", "calc(1 / 0.75)"], sm: ["0.875rem", "calc(1.25 / 0.875)"], base: ["1rem", "calc(1.5 / 1)"] },
  focus: { width: "3px", alpha: "50%", color: "var(--ring)" },
  // in spacing units (9, 8 and 11 steps, as the h-9, h-8 and h-11 they replace), so the density setting still scales web controls as it always has
  control: { h: "calc(var(--spacing) * 9)", hSm: "calc(var(--spacing) * 8)", hLg: "calc(var(--spacing) * 11)", target: "0px" },
  toggle: { check: "calc(var(--spacing) * 4)", switchW: "calc(var(--spacing) * 9)", switchH: "calc(var(--spacing) * 5)" },
  pressDim: "1",
  material: { blur: "0px", alpha: "100%" },
  sidebar: { itemH: "2rem", itemRadius: "calc(var(--radius) - 2px)", indicator: "0px" },
  menu: { itemH: "2rem", itemRadius: "calc(var(--radius) - 4px)", pad: "0.25rem" },
  scrollbar: "auto",
  titlebarH: "2.5rem",
  toolbarH: "52px",
}

/** A soft, large shadow with a hairline edge, as on a Mac. */
const hair = (o: number) => `0 0 0 0.5px rgb(0 0 0 / ${o})`

/** Fluent UI's shadow recipe (MIT): an ambient shadow plus a key shadow. */
const fluent = (ambientBlur: number, y: number, blur: number) => `0 0 ${ambientBlur}px rgb(0 0 0 / 0.12), 0 ${y}px ${blur}px rgb(0 0 0 / 0.14)`

export const FEELS: FeelPreset[] = [
  {
    slug: "web",
    title: "Web",
    tagline: "Neutral, as it is today",
    description: "Ballmac UI's own feel and the default: shadcn proportions, a soft focus halo and Tailwind's shadows. Nothing changes until you pick another feel.",
    spec: { radius: 0.625, density: "default", font: "keep" },
    controls: "none",
    tokens: WEB,
  },
  {
    slug: "macos",
    title: "macOS",
    tagline: "Compact, soft shadows, frosted menus",
    description:
      "Compact 28 px controls, 13 px text, a soft focus halo, hairline-edged shadows and frosted popovers and sidebars. For desktop apps built with Tauri or Electron that should sit comfortably next to native Mac apps.",
    spec: { radius: 0.375, density: "compact", font: "system" },
    controls: "left",
    tokens: {
      shadow: {
        xs: `0 0.5px 1px rgb(0 0 0 / 0.08), ${hair(0.04)}`,
        sm: `0 1px 3px rgb(0 0 0 / 0.12), ${hair(0.06)}`,
        md: `0 4px 12px -2px rgb(0 0 0 / 0.14), ${hair(0.06)}`,
        lg: `0 12px 32px -6px rgb(0 0 0 / 0.22), ${hair(0.08)}`,
        xl: `0 20px 48px -8px rgb(0 0 0 / 0.26), ${hair(0.08)}`,
        "2xl": `0 28px 64px -12px rgb(0 0 0 / 0.32), ${hair(0.1)}`,
        popover: `0 8px 30px rgb(0 0 0 / 0.22), ${hair(0.12)}`,
      },
      text: { xs: ["0.6875rem", "0.875rem"], sm: ["0.8125rem", "1.125rem"], base: ["0.9375rem", "1.375rem"] },
      focus: { width: "3px", alpha: "50%", color: "var(--ring)" },
      control: { h: "1.75rem", hSm: "1.5rem", hLg: "2rem", target: "0px" },
      toggle: { check: "0.875rem", switchW: "2.375rem", switchH: "1.375rem" },
      pressDim: "1",
      material: { blur: "24px", alpha: "78%" },
      sidebar: { itemH: "1.75rem", itemRadius: "0.375rem", indicator: "0px" },
      menu: { itemH: "1.5rem", itemRadius: "0.3125rem", pad: "0.3125rem" },
      scrollbar: "thin",
      titlebarH: "2.75rem",
      toolbarH: "52px",
    },
  },
  {
    slug: "ios",
    title: "iOS",
    tagline: "Big targets, rounded, dims on press",
    description:
      "44 px touch targets, 17 px text, large corners, flat grouped surfaces and a springier motion. Controls dim when pressed and nothing reacts to hover. For mobile web apps and webviews.",
    spec: { radius: 0.75, density: "comfortable", font: "system", speed: 1.1, bounce: 0.55, travel: 1.1, hover: 0, stagger: 1.1 },
    controls: "none",
    tokens: {
      shadow: {
        xs: "0 0 0 0 rgb(0 0 0 / 0)",
        sm: hair(0.06),
        md: "0 2px 10px rgb(0 0 0 / 0.08)",
        lg: "0 10px 40px rgb(0 0 0 / 0.18)",
        xl: "0 16px 56px rgb(0 0 0 / 0.22)",
        "2xl": "0 24px 72px rgb(0 0 0 / 0.28)",
        popover: "0 10px 40px rgb(0 0 0 / 0.18)",
      },
      text: { xs: ["0.8125rem", "1.125rem"], sm: ["0.9375rem", "1.375rem"], base: ["1.0625rem", "1.5rem"] },
      focus: { width: "3px", alpha: "40%", color: "var(--ring)" },
      control: { h: "2.75rem", hSm: "2.25rem", hLg: "3rem", target: "2.75rem" },
      toggle: { check: "1.375rem", switchW: "3.1875rem", switchH: "1.9375rem" },
      pressDim: "0.6",
      material: { blur: "30px", alpha: "80%" },
      sidebar: { itemH: "2.75rem", itemRadius: "0.625rem", indicator: "0px" },
      menu: { itemH: "2.75rem", itemRadius: "0px", pad: "0px" },
      scrollbar: "none",
      titlebarH: "2.75rem",
      toolbarH: "44px",
    },
  },
  {
    slug: "windows",
    title: "Windows",
    tagline: "Square-ish, bordered, crisp 2 px focus",
    description:
      "4 px corners, 32 px controls, Fluent-style layered shadows, a 2 px solid focus outline and a fast, no-bounce motion. For desktop apps that should sit comfortably next to native Windows apps.",
    spec: { radius: 0.25, density: "default", font: "system", speed: 1.3, bounce: 0, travel: 0.6, hover: 0.5, stagger: 0.5 },
    controls: "right",
    tokens: {
      shadow: { xs: fluent(2, 1, 2), sm: fluent(2, 2, 4), md: fluent(2, 4, 8), lg: fluent(2, 8, 16), xl: fluent(8, 14, 28), "2xl": fluent(8, 32, 64), popover: fluent(8, 14, 28) },
      text: { xs: ["0.75rem", "1rem"], sm: ["0.875rem", "1.25rem"], base: ["1rem", "1.375rem"] },
      focus: { width: "2px", alpha: "100%", color: "var(--foreground)" },
      control: { h: "2rem", hSm: "1.5rem", hLg: "2.5rem", target: "0px" },
      toggle: { check: "1.25rem", switchW: "2.5rem", switchH: "1.25rem" },
      pressDim: "1",
      material: { blur: "30px", alpha: "85%" },
      sidebar: { itemH: "2.5rem", itemRadius: "0.25rem", indicator: "3px" },
      menu: { itemH: "2rem", itemRadius: "0.25rem", pad: "0.25rem" },
      scrollbar: "thin",
      titlebarH: "2rem",
      toolbarH: "48px",
    },
  },
]

export const getFeel = (slug: string) => FEELS.find((f) => f.slug === slug)
export const isFeelId = (v: unknown): v is FeelId => FEELS.some((f) => f.slug === v)

export function normalizeFeel(v: unknown): FeelId {
  return isFeelId(v) ? v : DEFAULT_FEEL
}

/** The theme fields a feel sets, in full (motion included), ready to merge over a spec. */
export function feelSpec(id: FeelId) {
  const f = getFeel(id) ?? FEELS[0]!
  return { feel: f.slug, ...f.spec, ...normalizeMotion(f.spec) }
}

export type FeelVars = {
  /** `@theme inline` keys: Tailwind's shadow and text scales, pointed at the variables below. */
  theme: Record<string, string>
  /** Plain custom properties for `:root` (or any element that carries a feel). */
  root: Record<string, string>
}

/** Every feel emits the same set of variables, so a page can switch feel by setting `data-feel` or a different scope. */
export function feelVars(id: FeelId): FeelVars {
  const t = (getFeel(id) ?? FEELS[0]!).tokens
  const root: Record<string, string> = {}
  for (const [k, v] of Object.entries(t.shadow)) root[`bm-shadow-${k}`] = v
  for (const [k, [size, lh]] of Object.entries(t.text)) {
    root[`bm-text-${k}`] = size
    root[`bm-text-${k}-lh`] = lh
  }
  Object.assign(root, {
    "bm-focus-width": t.focus.width,
    "bm-focus-alpha": t.focus.alpha,
    "bm-focus-color": t.focus.color,
    "bm-control-h": t.control.h,
    "bm-control-h-sm": t.control.hSm,
    "bm-control-h-lg": t.control.hLg,
    "bm-target-min": t.control.target,
    "bm-check-size": t.toggle.check,
    "bm-switch-w": t.toggle.switchW,
    "bm-switch-h": t.toggle.switchH,
    "bm-press-dim": t.pressDim,
    "bm-material-blur": t.material.blur,
    "bm-material-alpha": t.material.alpha,
    "bm-sidebar-item-h": t.sidebar.itemH,
    "bm-sidebar-item-radius": t.sidebar.itemRadius,
    "bm-sidebar-indicator": t.sidebar.indicator,
    "bm-menu-item-h": t.menu.itemH,
    "bm-menu-item-radius": t.menu.itemRadius,
    "bm-menu-pad": t.menu.pad,
    "bm-scrollbar-width": t.scrollbar,
    "bm-titlebar-h": t.titlebarH,
    "bm-toolbar-h": t.toolbarH,
  })
  const theme: Record<string, string> = {}
  for (const k of Object.keys(t.shadow)) if (k !== "popover") theme[`shadow-${k}`] = `var(--bm-shadow-${k})`
  for (const k of Object.keys(t.text)) {
    theme[`text-${k}`] = `var(--bm-text-${k})`
    theme[`text-${k}--line-height`] = `var(--bm-text-${k}-lh)`
  }
  return { theme, root }
}

/**
 * The focus ring as a feel sets it. Components write the shadcn standard `focus-visible:ring-[3px]` and `ring-ring/50`, which
 * Tailwind puts in a cascade layer; this rule is written outside any layer, so it wins without editing a single component, and
 * it restyles shadcn's own components the same way. It reads the focus tokens, so at the web feel's values it changes nothing.
 */
export const FOCUS_SELECTOR = '[class*="focus-visible:ring-[3px]"]:focus-visible'
/** Input groups ring the whole group when a field inside it has focus. */
export const FOCUS_WITHIN_SELECTOR = '[class*="focus-within:ring-[3px]"]:focus-within'

export const focusRule = (): Record<string, Record<string, string>> => {
  const props = {
    "--tw-ring-color": "color-mix(in oklab, var(--bm-focus-color, var(--ring)) var(--bm-focus-alpha, 50%), transparent)",
    "--tw-ring-shadow": "var(--tw-ring-inset,) 0 0 0 calc(var(--bm-focus-width, 3px) + var(--tw-ring-offset-width, 0px)) var(--tw-ring-color)",
  }
  return { [FOCUS_SELECTOR]: props, [FOCUS_WITHIN_SELECTOR]: { ...props } }
}

/** Everything a feel adds beyond variables: the focus ring, and the scrollbar style (in the base layer, so a utility still wins). */
export const feelRules = (): Record<string, Record<string, string | Record<string, string>>> => ({
  ...focusRule(),
  "@layer base": { "*": { "scrollbar-width": "var(--bm-scrollbar-width, auto)" } },
})
