import { ImageCropper } from "@/components/ballmac/image-cropper"

/** With no picture yet, the cropper holds its place and says it is loading. */
export default function ImageCropperLoading() {
  return <ImageCropper src="" height={260} className="w-full max-w-md" />
}
