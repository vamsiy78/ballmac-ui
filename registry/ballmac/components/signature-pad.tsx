// Ballmac UI: Signature Pad. https://ui.ballmac.com/components/signature-pad
"use client"

import * as React from "react"
import { PenLine, RotateCcw, Trash2, Type } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type SignatureValue =
  | {
      /** Drawing mode. */ mode: "draw"
      /** SVG path strings in a 600 × 200 viewBox. */ strokes: string[]
    }
  | { /** Typing mode. */ mode: "type"; /** Typed signer name. */ text: string }
type SignaturePadProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange"
> & {
  /** Visible and accessible field label. */
  label: string
  /** Controlled signature. */
  value?: SignatureValue
  /** Initial signature. */
  defaultValue?: SignatureValue
  /** Called when a stroke, typed name, or mode changes. */
  onValueChange?: (value: SignatureValue) => void
  /** Native form field name for serialized signature data. */
  name?: string
  /** Disable drawing, typing, and actions. */
  disabled?: boolean
}
function SignaturePad({
  className,
  label,
  value,
  defaultValue = { mode: "draw", strokes: [] },
  onValueChange,
  name,
  disabled = false,
  ...props
}: SignaturePadProps) {
  const msg = useMessages()
  const [internal, setInternal] = React.useState<SignatureValue>(defaultValue)
  const [preview, setPreview] = React.useState<string | null>(null)
  const active = React.useRef<string | null>(null)
  const current = value ?? internal
  function update(next: SignatureValue) {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }
  function point(event: React.PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return [
      Math.max(
        0,
        Math.min(600, ((event.clientX - rect.left) / rect.width) * 600),
      ),
      Math.max(
        0,
        Math.min(200, ((event.clientY - rect.top) / rect.height) * 200),
      ),
    ]
  }
  function begin(event: React.PointerEvent<SVGSVGElement>) {
    if (disabled || current.mode !== "draw") return
    const [x, y] = point(event)
    active.current = `M ${x.toFixed(1)} ${y.toFixed(1)}`
    setPreview(active.current)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }
  function draw(event: React.PointerEvent<SVGSVGElement>) {
    if (!active.current) return
    const [x, y] = point(event)
    active.current += ` L ${x.toFixed(1)} ${y.toFixed(1)}`
    setPreview(active.current)
  }
  function end() {
    if (!active.current || current.mode !== "draw") return
    const stroke = active.current.includes(" L ")
      ? active.current
      : `${active.current} l 0.1 0`
    update({ mode: "draw", strokes: [...current.strokes, stroke] })
    active.current = null
    setPreview(null)
  }
  function clear() {
    update(
      current.mode === "draw"
        ? { mode: "draw", strokes: [] }
        : { mode: "type", text: "" },
    )
  }
  const hasValue =
    current.mode === "draw"
      ? current.strokes.length > 0
      : current.text.length > 0
  return (
    <div
      data-slot="signature-pad"
      className={cn(
        "bg-card min-w-0 rounded-xl border border-border p-4",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-muted-foreground text-xs">{msg("signature-pad.drawOrType", "Draw or type")}</span>
      </div>
      <div
        role="group"
        aria-label={msg("signature-pad.signatureMethod", "Signature method")}
        className="bg-muted mt-3 inline-flex rounded-lg p-1"
      >
        <button
          type="button"
          disabled={disabled}
          aria-pressed={current.mode === "draw"}
          onClick={() => update({ mode: "draw", strokes: [] })}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium outline-none transition-colors duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 motion-reduce:transition-none",
            current.mode === "draw"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <PenLine aria-hidden="true" className="size-3.5" />
          {msg("signature-pad.draw", "Draw")}
        </button>
        <button
          type="button"
          disabled={disabled}
          aria-pressed={current.mode === "type"}
          onClick={() => update({ mode: "type", text: "" })}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium outline-none transition-colors duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 motion-reduce:transition-none",
            current.mode === "type"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Type aria-hidden="true" className="size-3.5" />
          {msg("signature-pad.type", "Type")}
        </button>
      </div>
      {current.mode === "draw" ? (
        <div className="border-input bg-background mt-3 overflow-hidden rounded-md border">
          <svg
            data-slot="signature-pad-canvas"
            role="img"
            aria-label={msg("signature-pad.drawingArea", "{label} drawing area", { label })}
            viewBox="0 0 600 200"
            preserveAspectRatio="none"
            onPointerDown={begin}
            onPointerMove={draw}
            onPointerUp={end}
            onPointerCancel={() => {
              active.current = null
              setPreview(null)
            }}
            className={cn(
              "text-foreground aspect-[3/1] w-full touch-none",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            <path
              d="M 0 160 H 600"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.16"
              strokeWidth="1"
              strokeDasharray="4 5"
            />
            {current.strokes.map((stroke, index) => (
              <path
                key={index}
                d={stroke}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {preview && (
              <path
                d={preview}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </div>
      ) : (
        <input
          data-slot="signature-pad-type"
          type="text"
          value={current.text}
          aria-label={msg("signature-pad.typeLabel", "Type {label}", { label: label.toLowerCase() })}
          placeholder={msg("signature-pad.typeYourFullName", "Type your full name")}
          disabled={disabled}
          onChange={(event) =>
            update({ mode: "type", text: event.target.value })
          }
          className="border-input bg-background mt-3 h-20 w-full rounded-md border px-4 font-serif text-2xl italic outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
        />
      )}
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">
          {current.mode === "draw"
            ? "Use a pointer to sign; choose Type for keyboard entry."
            : "Your typed name is saved as the signature."}
        </p>
        <div className="flex shrink-0 gap-1">
          {current.mode === "draw" && (
            <button
              type="button"
              aria-label={msg("signature-pad.undoLastStroke", "Undo last stroke")}
              disabled={disabled || !hasValue}
              onClick={() =>
                update({ mode: "draw", strokes: current.strokes.slice(0, -1) })
              }
              className="text-muted-foreground hover:bg-accent flex size-8 items-center justify-center rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-40"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
            </button>
          )}
          <button
            type="button"
            aria-label={msg("signature-pad.clearSignature", "Clear signature")}
            disabled={disabled || !hasValue}
            onClick={clear}
            className="text-muted-foreground hover:bg-accent flex size-8 items-center justify-center rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-40"
          >
            <Trash2 aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
      {name && (
        <input type="hidden" name={name} value={JSON.stringify(current)} />
      )}
    </div>
  )
}
export { SignaturePad, type SignaturePadProps, type SignatureValue }
