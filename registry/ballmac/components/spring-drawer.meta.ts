import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "spring-drawer",
  type: "registry:ui",
  title: "Spring Drawer",
  description:
    "A drawer with spring physics: drag the handle to snap between heights or flick it closed, or slide in from the left or right, on Radix Dialog for focus trapping and scroll lock.",
  category: "primitives",
  tags: ["drawer", "sheet", "snap", "drag", "dialog"],
  files: [{ path: "components/spring-drawer.tsx" }],
  dependencies: ["motion@^12", "lucide-react", "radix-ui"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "spring-drawer-demo", title: "Bottom drawer with snap points", file: "spring-drawer-demo.tsx" },
    { name: "spring-drawer-side", title: "Side drawers", file: "spring-drawer-side.tsx" },
  ],
  ai: {
    summary:
      "<SpringDrawer side snapPoints defaultSnap><SpringDrawerTrigger/><SpringDrawerContent><SpringDrawerHeader><SpringDrawerTitle/></SpringDrawerHeader><SpringDrawerBody/></SpringDrawerContent></SpringDrawer>. snapPoints are fractions of the screen height. The handle is a keyboard slider.",
    whenToUse: ["Mobile-style sheets that can sit half open", "Details panels that can be pulled larger"],
    whenNotToUse: ["Simple modals (dialog)", "Vaul-style nested drawers (drawer)"],
    composesWith: ["drawer", "sheet", "dialog"],
    a11y: [
      { keys: "Escape", action: "Closes the drawer" },
      { keys: "ArrowUp / ArrowDown", action: "On the handle, moves between snap points" },
      { keys: "Focus", action: "Trapped in the drawer and returned to the trigger on close" },
      { keys: "Reduced motion", action: "The drawer moves without springs" },
    ],
    customization: ["side", "snapPoints and defaultSnap", "onSnapChange", "maxWidth", "showCloseButton"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
