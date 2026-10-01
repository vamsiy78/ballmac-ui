import { IconCloud } from "@/components/ballmac/icon-cloud"

const stack = ["React", "Next.js", "TypeScript", "Tailwind", "Radix", "Motion", "Node", "Postgres", "Redis", "Docker", "Vite", "tRPC", "Prisma", "Stripe", "Vercel", "GraphQL", "Bun", "Zod"]

function Chip({ name }: { name: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-[13px] font-medium whitespace-nowrap shadow-sm">
      <span aria-hidden="true" className="flex size-5 items-center justify-center rounded-md bg-foreground text-[10px] font-bold text-background">{name[0]}</span>
      {name}
    </span>
  )
}

export default function IconCloudDemo() {
  return (
    <IconCloud size={390} label="Technologies we use">
      {stack.map((name) => (
        <Chip key={name} name={name} />
      ))}
    </IconCloud>
  )
}
