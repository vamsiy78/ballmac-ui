---
title: "Motion is part of the theme"
date: 2026-10-11
tags: [components, themes, docs]
releases: ["motion-presets 1.1.0"]
summary: "Six settings describe how a product moves, and every duration, easing, lift and stagger follows from them."
shot: /themes?mo=playful
shotSelector: "#motion"
imageAlt: "The theme builder with a Motion group and the motion lab."
---

### New

- Six settings: speed, bounce, travel, hover, stagger and decorative loops. Durations, easings, hover lift, button press and the CSS spring curve derive from them, and the defaults reproduce the current look exactly. See [Motion settings](/docs/reference/motion-settings).
- Tailwind's scales follow: `duration-75` to `duration-1000`, `delay-*` and the `ease-*` classes read the theme, and a new `ease-spring` is a real spring written as a CSS `linear()` easing. Dialogs, popovers, menus and accordions follow through tw-animate-css, with no edits to existing components.
- Five ready-made feels, each its own registry theme: `@ballmac/motion-native`, `-calm`, `-snappy`, `-playful` and `-still`. Each of the twelve color themes carries a feel that suits it.
- The theme builder has a Motion group (a personality picker and a slider per setting) and a motion lab with easing curves, hover and press, stagger, durations, JavaScript springs and loops; `/themes?mo=playful` opens a feel.
- Motion presets 1.1.0 adds `useMotion`, `useLoopsPaused` and `MotionProvider` for the same numbers in JavaScript. See [Use theme motion in your own code](/docs/guides/motion).
- `pnpm bump` writes the version bump and changelog entry the version check asks for.

### Improved

- Reduced motion is part of the theme: a `prefers-reduced-motion` rule removes travel, lift, bounce and loops and keeps fades; the Still feel ships those values to every visitor.
- Decorative loops (13 components) hold still when loops are turned off; spinners and thinking indicators keep running. Hover lift and button press follow the theme in Card, Button, Suggestion Chips, Workspace Card, three blocks and seven templates.
- The Figma tokens export includes the motion settings as W3C duration and number tokens.
