import { AppIcon, DriveIcon, FileIcon, FolderIcon } from "@/components/ballmac/mac-icons"
import { Compass, Mail, MessageCircle, Music, Settings } from "lucide-react"

export default function MacIconsDemo() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-8 rounded-2xl border bg-card p-6 sm:p-8">
      <div className="flex flex-wrap items-end gap-5">
        <AppIcon size={72} tone="blue"><Compass /></AppIcon>
        <AppIcon size={72} tone="green"><MessageCircle /></AppIcon>
        <AppIcon size={72} tone="orange"><Music /></AppIcon>
        <AppIcon size={72} tone="red"><Mail /></AppIcon>
        <AppIcon size={72} tone="graphite"><Settings /></AppIcon>
      </div>
      <div className="flex flex-wrap items-end gap-5">
        <FolderIcon size={72} />
        <FolderIcon size={72} tone="teal" />
        <FolderIcon size={72} tone="purple" />
        <FileIcon size={72} label="pdf" tone="red" />
        <FileIcon size={72} label="fig" tone="purple" />
        <FileIcon size={72} />
        <DriveIcon size={72} />
      </div>
    </div>
  )
}
