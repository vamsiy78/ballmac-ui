import { ImageCropper } from "@/components/ballmac/image-cropper"

/** A picture that is not a picture: the cropper says so and offers another try. */
export default function ImageCropperError() {
  return <ImageCropper src="data:image/png;base64,bm90IGFuIGltYWdl" height={260} className="w-full max-w-md" />
}
