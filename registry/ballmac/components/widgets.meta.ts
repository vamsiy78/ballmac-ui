import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "widgets",
  type: "registry:ui",
  title: "Widgets",
  description:
    "Desktop widgets in three sizes: weather with a sky gradient, hourly strip and daily ranges; a calendar with a month grid and events; a battery widget with rings. They scale with their width and use UTC dates.",
  category: "macos",
  tags: ["widgets", "weather", "calendar", "battery", "macos", "dashboard", "desktop"],
  files: [{ path: "components/widgets.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "widgets-demo", title: "Weather, calendar and battery", file: "widgets-demo.tsx" },
    { name: "widgets-sizes", title: "All three sizes", file: "widgets-sizes.tsx" },
  ],
  ai: {
    summary:
      "<WeatherWidget city temperature condition high low hourly daily size />, <CalendarWidget date=\"2026-10-01\" events size />, <BatteryWidget devices size />. Width is set with className; height follows the size (small square, medium 2:1, large near-square). <Widget> is the bare frame.",
    whenToUse: ["Dashboards that want glanceable cards", "Desktop and Today-view mockups"],
    whenNotToUse: ["Interactive charts (chart)", "Live data fetching: pass data in"],
    composesWith: ["desktop-icons", "phone-frame", "control-center"],
    a11y: [
      { keys: "Screen readers", action: "Each widget is a named section with a one-sentence summary; decorative icons are hidden" },
      { keys: "Color", action: "Charge level and conditions are also given in words" },
    ],
    customization: ["size: small | medium | large", "className width, e.g. w-48", "WeatherWidget: condition clear | partly-cloudy | cloudy | rain | snow | storm | night", "BatteryWidget devices with charging"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
