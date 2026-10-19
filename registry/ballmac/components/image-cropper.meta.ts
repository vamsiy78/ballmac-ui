import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "image-cropper",
  type: "registry:ui",
  title: "Image Cropper",
  description:
    "Crop a picture under a fixed frame: drag to move, wheel, pinch or slider to zoom, straighten and turn by quarters, any aspect ratio or a round avatar, full keyboard control and a canvas export to a file.",
  category: "forms",
  tags: ["image", "crop", "avatar", "upload", "zoom", "rotate", "canvas"],
  files: [{ path: "components/image-cropper.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "i18n"],
  examples: [
    { name: "image-cropper-demo", title: "Square crop with a result", file: "image-cropper-demo.tsx" },
    { name: "image-cropper-aspect", title: "Choose the shape", file: "image-cropper-aspect.tsx" },
    { name: "image-cropper-avatar", title: "Round avatar from a file", file: "image-cropper-avatar.tsx" },
    { name: "image-cropper-controlled", title: "Controlled, with the area", file: "image-cropper-controlled.tsx" },
    { name: "image-cropper-loading", title: "Loading", file: "image-cropper-loading.tsx" },
    { name: "image-cropper-error", title: "Could not load", file: "image-cropper-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "image-cropper-loading", trigger: "no src yet, or while the picture loads", note: "A skeleton in the picture's place, announced as loading; the controls are off." },
    { id: "error", title: "Could not load", example: "image-cropper-error", trigger: "the picture fails to load", note: "A message with a Try again button, announced as an alert; onError gets the error." },
  ],
  ai: {
    summary:
      "<ImageCropper src aspect={1} cropperRef={ref} />. Get the file with await ref.current.toBlob({ width, type }); onCropComplete gives the area in original pixels to crop on a server. shape=\"round\" for avatars.",
    whenToUse: [
      "Profile pictures, cover images and product photos cropped before upload",
      "Any upload that needs a fixed aspect ratio",
      "Straightening a slightly tilted photo",
    ],
    whenNotToUse: [
      "Free-form selection boxes with resizable handles",
      "Photo editing with filters, text or drawing",
      "Pictures from another site without CORS headers, which cannot be exported",
    ],
    composesWith: ["file-dropzone", "avatar", "dialog", "button"],
    a11y: [
      { keys: "Arrow keys", action: "Move the picture under the frame; Shift moves it further" },
      { keys: "+ / -", action: "Zoom in and out; the zoom is announced" },
      { keys: "[ / ]", action: "Turn a quarter left or right" },
      { keys: "0", action: "Reset" },
      { keys: "Sliders and buttons", action: "Zoom and straighten are native range inputs with spoken values; turn and reset are buttons" },
    ],
    customization: [
      "aspect, shape, height, maxZoom, grid, zoomOnWheel",
      "value and onCropChange to hold the crop; onCropComplete for the area in original pixels",
      "toBlob options: width, maxWidth, type, quality, round, background",
      "controls={false} to build your own controls on the same ref",
    ],
  },
  version: "1.0.0",
  updated: "2026-10-19",
});
