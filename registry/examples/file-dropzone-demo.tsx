import { FileDropzone } from "@/components/ballmac/file-dropzone"
export default function FileDropzoneDemo() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-3 text-sm font-semibold">Attach project files</div>
      <FileDropzone
        accept=".pdf,.png,.jpg"
        maxFiles={3}
        maxSize={5 * 1024 * 1024}
      />
      <p className="mt-2 text-xs text-muted-foreground">
        PDF or image files for this review.
      </p>
    </div>
  )
}
