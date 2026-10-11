import { defineItem } from "@ballmac-ui/metadata"
import { getPersonality, motionVars, reducedMotionRule } from "@ballmac-ui/theme-engine"

const feel = getPersonality("still")!
const vars = motionVars(feel.motion)

export default defineItem({
  name: "motion-still",
  type: "registry:theme",
  title: `${feel.title} motion`,
  description: feel.description,
  category: "foundation",
  tags: ["motion", "theme", "tokens", "animation", "still"],
  cssVars: { theme: vars.theme, light: vars.root },
  ...(Object.keys(vars.reduced).length ? { css: reducedMotionRule(vars.reduced) } : {}),
  docs: `Changes how everything moves and leaves your colours alone. Tune it, preview it on real components and copy the CSS at https://ui.ballmac.com/themes?mo=still#motion`,
  ai: {
    summary: `${feel.tagline}. Sets speed, bounce, travel, hover lift and stagger as CSS variables that Tailwind's duration and easing scales and every Ballmac component follow, with a reduced-motion fallback.`,
    whenToUse: ["Products that must hold perfectly still for everyone", "Kiosks, trading screens and high-focus tools"],
    whenNotToUse: ["The project needs its own timing system and does not use Tailwind's duration and ease utilities"],
    customization: ["Change --bm-speed, --bm-bounce, --bm-travel, --bm-hover and --bm-stagger by hand, or tune them at https://ui.ballmac.com/themes#motion"],
  },
  version: "1.0.0",
  updated: "2026-10-11",
})
