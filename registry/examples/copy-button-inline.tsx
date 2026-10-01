import { CopyButton } from "@/components/ballmac/copy-button"

export default function CopyButtonInline() {
  return (
    <ul className="grid w-full max-w-sm grid-cols-[minmax(0,1fr)] gap-2 text-sm">
      {[
        ["Project ID", "prj_8f3a1c92e7"],
        ["Region", "eu-west-1"],
        ["Webhook URL", "https://api.example.com/hooks/in/8f3a"],
      ].map(([label, value]) => (
        <li key={label} className="flex min-w-0 items-center gap-2 rounded-lg border bg-card py-1.5 pr-1.5 pl-3">
          <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
          <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{value}</code>
          <CopyButton value={value!} ariaLabel={`Copy ${label}`} />
        </li>
      ))}
    </ul>
  )
}
