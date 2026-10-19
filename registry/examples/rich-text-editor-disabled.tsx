import { RichTextEditor } from "@/components/ballmac/rich-text-editor"

export default function RichTextEditorDisabled() {
  return (
    <RichTextEditor
      label="Locked notes"
      defaultValue="<p>These notes are locked while the report is being reviewed. Ask the owner to unlock them.</p>"
      disabled
      minHeight={120}
      className="w-full max-w-xl"
    />
  )
}
