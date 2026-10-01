import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "showcase-1",
  type: "registry:block",
  title: "Showcase 1: interactive Mac desktop",
  description: "A working Mac desktop for your landing page: wallpaper, a menu bar with menus and a clock, draggable and resizable windows, desktop widgets and a magnifying dock that launches and relaunches them.",
  category: "blocks",
  blockCategory: "showcase",
  tags: ["mac", "desktop", "showcase", "windows", "dock", "menu bar", "demo"],
  files: [{ path: "components/blocks/showcase-1/showcase-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "dock", "menu-bar", "widgets", "window-manager"],
  examples: [
    { name: "showcase-1-demo", title: "Default", file: "showcase-1-demo.tsx" },
    { name: "showcase-1-custom", title: "Your own app window", file: "showcase-1-custom.tsx" },
  ],
  ai: {
    summary: "A hero-sized interactive screenshot. Set app, time (ISO, fixed) and pass your own window content as children; widgets={false} hides the desk widgets and notes={false} the sample Notes window. Windows can be dragged, resized, zoomed and minimized; the dock reopens closed apps.",
    whenToUse: ["Landing pages for Mac apps that want to be tried, not just seen", "Under a hero as a live product tour"],
    whenNotToUse: ["Showing one screenshot (use laptop-frame or browser-frame)", "Non-desktop products"],
    composesWith: ["hero-5", "download-1", "features-7", "devices-1"],
    a11y: [
      { keys: "Arrow Left / Right in the dock", action: "Moves between dock items; Enter launches or reopens an app" },
      { keys: "Window title bars", action: "Windows can be moved and resized with the keyboard through the window manager; traffic lights are real buttons" },
      { keys: "Menu bar", action: "Arrow keys move between menus; Escape closes" },
    ],
    customization: ["app, time, widgets, notes, height", "children: your window content, laid out in a container (use @sm: / @md: variants)"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
