import { RichTextEditor } from "@/components/ballmac/rich-text-editor"

export default function RichTextEditorLoading() {
  return <RichTextEditor label="Notes" state="loading" minHeight={150} className="w-full max-w-xl" />
}
