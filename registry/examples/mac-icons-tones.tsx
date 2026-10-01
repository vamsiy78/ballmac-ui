import { AppIcon, FolderIcon, type IconTone } from "@/components/ballmac/mac-icons"

const tones: IconTone[] = ["blue", "teal", "green", "amber", "orange", "red", "purple", "graphite"]

export default function MacIconsTones() {
  return (
    <ul className="grid w-full max-w-xl grid-cols-4 gap-x-4 gap-y-6 rounded-2xl border bg-card p-6 sm:grid-cols-8">
      {tones.map((tone) => (
        <li key={tone} className="flex flex-col items-center gap-2">
          <FolderIcon size={44} tone={tone} />
          <AppIcon size={36} tone={tone}>
            {tone[0]!.toUpperCase()}
          </AppIcon>
          <span className="text-xs text-muted-foreground capitalize">{tone}</span>
        </li>
      ))}
    </ul>
  )
}
