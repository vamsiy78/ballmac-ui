import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "qr-code",
  type: "registry:ui",
  title: "QR Code",
  description:
    "A QR code drawn as accessible SVG: square, rounded or dotted modules that keep scannable corner markers, a logo slot, error-correction levels, a clear message when text is too long, and PNG and SVG downloads.",
  category: "data-display",
  tags: ["qr", "code", "svg", "scan", "share", "download", "wifi"],
  files: [{ path: "components/qr-code.tsx" }],
  dependencies: ["uqr@^0.1"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "qr-code-demo", title: "Link with downloads", file: "qr-code-demo.tsx" },
    { name: "qr-code-shapes", title: "Shapes", file: "qr-code-shapes.tsx" },
    { name: "qr-code-logo", title: "With a logo", file: "qr-code-logo.tsx" },
    { name: "qr-code-live", title: "Wi-Fi code, live", file: "qr-code-live.tsx" },
    { name: "qr-code-empty", title: "Nothing to encode", file: "qr-code-empty.tsx" },
    { name: "qr-code-error", title: "Too long", file: "qr-code-error.tsx" },
  ],
  states: [
    { id: "empty", title: "Nothing yet", example: "qr-code-empty", trigger: "value=\"\"", note: "A dashed box that says there is nothing to encode yet, the same size as the code so nothing jumps." },
    { id: "error", title: "Too long", example: "qr-code-error", trigger: "a value longer than a QR code holds", note: "A red box that says the text is too long and to use a shorter link, announced as an alert; onError gets the error." },
  ],
  ai: {
    summary:
      "<QRCode value=\"https://…\" size={192} />. shape is square, rounded or dots; level is L, M, Q or H; logo is a node drawn in the middle. Use svgRef with downloadQRCode(svg, { format }) for a save button.",
    whenToUse: [
      "Sharing a link, a Wi-Fi network, a ticket or a pairing code to a phone",
      "Download or print screens that need a crisp code at any size",
      "A branded code with a logo in the middle",
    ],
    whenNotToUse: [
      "Reading or scanning codes; this only draws them",
      "Very long text; shorten it first (a link shortener or an id)",
      "A barcode of another kind; this is QR only",
    ],
    composesWith: ["button", "card", "dialog"],
    a11y: [
      { keys: "Screen readers", action: "The code is an image named \"QR code for …\"; label replaces the name when the value is long or private" },
      { keys: "Always give a text alternative", action: "Show the link or code as text near the picture, for people who cannot scan" },
    ],
    customization: [
      "size, level, quietZone (keep at least 4)",
      "shape: square | rounded | dots",
      "foreground and background: keep dark on light so it scans in dark mode",
      "logo and logoSize (up to 0.3)",
    ],
  },
  source: {
    name: "uqr",
    url: "https://github.com/unjs/uqr",
    license: "MIT",
    copyright: "Copyright (c) 2023 Anthony Fu",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-10-19",
});
