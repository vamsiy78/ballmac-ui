import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "gauge",
  type: "registry:ui",
  title: "Gauge",
  description:
    "A half-circle gauge with a needle, colored zones and a target mark. The value, the zone it is in and the target are written as text, and the needle sweeps in once and holds still with reduced motion.",
  category: "data-display",
  tags: ["chart", "gauge", "meter", "kpi", "budget", "slo", "dashboard", "health"],
  files: [{ path: "components/gauge.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "i18n", "motion-presets"],
  examples: [
    { name: "gauge-demo", title: "Three gauges with zones and a target", file: "gauge-demo.tsx" },
    { name: "gauge-single", title: "A 0 to 5 score", file: "gauge-single.tsx" },
  ],
  ai: {
    summary:
      "value and label are required; min and max default to 0 and 100. zones is [{ to, label }] from low to high: with zones the arc is colored and the needle is shown, without them the arc fills. target marks a point. format(value) formats the value and ends; description adds a line. It is a role=meter with a spoken value and zone.",
    whenToUse: ["An error budget, quota, load or score at a glance", "A KPI with healthy, watch and at-risk bands"],
    whenNotToUse: ["Progress toward a finish; use progress or circular-progress", "Trends; use sparkline"],
    composesWith: ["stat-card", "kpi-row", "uptime-tracker", "bullet-chart"],
    a11y: [
      { keys: "Meter", action: "role=meter with label, min, max, now and a text value that includes the zone" },
      { keys: "Zone", action: "Written under the value; color only repeats it" },
      { keys: "Motion", action: "The needle sweep is off with reduced motion" },
    ],
    customization: ["value, min, max", "zones", "target", "format and description"],
  },
  statesNone: "A presentational gauge: the value is passed in, so it has nothing of its own to load.",
  version: "1.0.0",
  updated: "2026-10-25",
})
