import { BarChart3, Blocks, Code2, Layers, Rocket, ShieldCheck, Sparkles, Users, Workflow } from "lucide-react";
import { MegaMenu, type MegaMenuItem } from "@/components/ballmac/mega-menu";
const megaItems: MegaMenuItem[] = [
  {
    label: "Product",
    columns: [
      {
        title: "Build",
        links: [
          { title: "Workspaces", href: "#workspaces", description: "Projects, files and approvals in one place.", icon: <Layers /> },
          { title: "Automations", href: "#automations", description: "Run tasks when things change.", icon: <Workflow />, badge: "New" },
          { title: "API", href: "#api", description: "Build on the same data.", icon: <Code2 /> },
        ],
      },
      {
        title: "Run",
        links: [
          { title: "Analytics", href: "#analytics", description: "Usage and performance at a glance.", icon: <BarChart3 /> },
          { title: "Security", href: "#security", description: "Roles, audit logs and sign-in policies.", icon: <ShieldCheck /> },
          { title: "Integrations", href: "#integrations", description: "Connect the tools you already use.", icon: <Blocks /> },
        ],
      },
    ],
    featured: { title: "What's new", description: "See the latest releases and what they change for your team.", href: "#changelog", media: <Sparkles />, cta: "Read the changelog" },
  },
  {
    label: "Solutions",
    columns: [
      {
        links: [
          { title: "Startups", href: "#startups", description: "Move fast with a small team.", icon: <Rocket /> },
          { title: "Enterprise", href: "#enterprise", description: "Controls for larger organizations.", icon: <Users /> },
        ],
      },
    ],
  },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
];
export default function MegaMenuDemo() {
  return (
    <div className="grid min-h-56 w-full max-w-3xl content-start gap-6 rounded-xl border bg-card p-3 shadow-sm">
      <div className="flex items-center gap-4 rounded-lg border bg-background px-3 py-1.5">
        <span className="text-[15px] font-semibold tracking-tight">Acme</span>
        <MegaMenu items={megaItems} label="Main" />
        <span className="ml-auto text-xs text-muted-foreground md:hidden">Menu on small screens</span>
      </div>
      <p className="px-2 text-sm text-muted-foreground">Open Product to see grouped links and a featured card. Arrow keys move between menus.</p>
    </div>
  );
}
