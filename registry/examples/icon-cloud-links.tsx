import { IconCloud } from "@/components/ballmac/icon-cloud"

const topics = ["Components", "Blocks", "Templates", "Themes", "Charts", "Forms", "Motion", "Docs", "AI", "Tables", "Maps", "Icons"]

export default function IconCloudLinks() {
  return (
    <IconCloud size={340} speed={0.8} label="Browse topics">
      {topics.map((t) => (
        <a
          key={t}
          href={`#${t.toLowerCase()}`}
          className="rounded-md border bg-card px-2.5 py-1 text-xs font-medium whitespace-nowrap shadow-sm outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {t}
        </a>
      ))}
    </IconCloud>
  )
}
