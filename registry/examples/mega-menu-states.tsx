import { MegaMenuMobileList, type MegaMenuItem } from "@/components/ballmac/mega-menu";
const items: MegaMenuItem[] = [
  {
    label: "Product",
    columns: [
      {
        links: [
          { title: "Workspaces", href: "#workspaces", description: "Projects, files and approvals." },
          { title: "Automations", href: "#automations", description: "Run tasks when things change." },
          { title: "Analytics", href: "#analytics", description: "Usage at a glance." },
        ],
      },
    ],
  },
  {
    label: "Solutions",
    columns: [{ links: [{ title: "Startups", href: "#startups" }, { title: "Enterprise", href: "#enterprise" }] }],
  },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
];
export default function MegaMenuStates() {
  return (
    <div className="w-full max-w-xs rounded-xl border bg-card p-2 shadow-sm">
      <MegaMenuMobileList items={items} />
    </div>
  );
}
