import { FileDropzone } from "@/components/ballmac/file-dropzone"
export default function FileDropzoneStates() {
  return (
    <div className="w-full max-w-sm">
      <p className="mb-3 text-sm font-semibold">Upload a profile image</p>
      <FileDropzone
        accept="image/*"
        multiple={false}
        maxSize={2 * 1024 * 1024}
      />
    </div>
  )
}
