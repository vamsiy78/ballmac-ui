// Ballmac UI: Image Cropper. https://ui.ballmac.com/components/image-cropper
"use client"

import * as React from "react"
import { ImageOff, RotateCcw, RotateCw, ZoomIn, ZoomOut } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { useMessages } from "@/lib/ballmac/i18n"
import { cn } from "@/lib/utils"

/** How the picture sits under the frame. `x` and `y` move its center from the frame's center, in pixels on screen. `zoom` is 1 at the smallest the picture may be. */
type Crop = { x: number; y: number; zoom: number; /** Degrees, any amount. */ rotation: number }

/** The cropped part, in pixels of the original picture. With a rotation it is the box around the rotated frame. */
type CropArea = { x: number; y: number; width: number; height: number }

type CropResult = { crop: Crop; area: CropArea; /** The crop frame's width and height on screen. */ frame: { width: number; height: number } }

type CropImageOptions = {
  /** Width of the result in pixels. The height follows the frame. Defaults to the cropped area's own width, at most `maxWidth`. */
  width?: number
  maxWidth?: number
  type?: "image/png" | "image/jpeg" | "image/webp"
  quality?: number
  /** Cut the corners away, for a round avatar. A PNG or WebP keeps them see-through; a JPEG fills them with `background`. */
  round?: boolean
  background?: string
}

type ImageCropperHandle = {
  /** The crop as it is now. */
  getCrop: () => CropResult | null
  /** The cropped picture as a file. */
  toBlob: (options?: CropImageOptions) => Promise<Blob>
  reset: () => void
}

type ImageCropperProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue" | "ref"> & {
  /** The picture: a web address or an object URL. */
  src: string
  /** Width divided by height of the frame: 1 for a square, 16 / 9 for a banner. */
  aspect?: number
  /** A round frame shows what a round avatar will keep. */
  shape?: "rect" | "round"
  value?: Crop
  defaultValue?: Partial<Crop>
  onCropChange?: (crop: Crop) => void
  /** Called when a drag, a key press or a slider move ends, with the crop in pixels of the original. */
  onCropComplete?: (result: CropResult) => void
  /** Zoom the picture can reach. */
  maxZoom?: number
  /** Height of the picture area. */
  height?: number
  /** Show thirds lines over the frame. */
  grid?: boolean
  /** Zoom with the mouse wheel. Off if the cropper sits in a page people scroll through. */
  zoomOnWheel?: boolean
  /** Hide the zoom, straighten and rotate controls, to place your own. */
  controls?: boolean
  /** Written for a screen reader: what the picture shows. */
  alt?: string
  /** `crossorigin` for the picture. Needed to export one from another site. */
  crossOrigin?: "anonymous" | "use-credentials" | ""
  onError?: (error: Error) => void
  /** Gives you `toBlob`, `getCrop` and `reset`. */
  cropperRef?: React.Ref<ImageCropperHandle>
}

// ------------------------------------------------------------------------------------------------- geometry (pure, so it can be tested)

const rad = (d: number) => (d * Math.PI) / 180
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

/** The smallest scale at which a picture of this size, turned by `rotation`, still covers the frame. */
export function coverScale(image: { width: number; height: number }, frame: { width: number; height: number }, rotation: number) {
  const t = rad(rotation)
  const cos = Math.abs(Math.cos(t))
  const sin = Math.abs(Math.sin(t))
  // the frame's corners, turned into the picture's own axes, must lie inside it
  const needW = (frame.width * cos + frame.height * sin) / image.width
  const needH = (frame.width * sin + frame.height * cos) / image.height
  return Math.max(needW, needH)
}

/** Keeps the picture over the frame: moves `offset` to the nearest place where no corner of the frame is outside it. */
export function clampOffset(offset: { x: number; y: number }, image: { width: number; height: number }, frame: { width: number; height: number }, scale: number, rotation: number) {
  const t = rad(rotation)
  const cos = Math.cos(t)
  const sin = Math.sin(t)
  const halfW = (image.width * scale) / 2
  const halfH = (image.height * scale) / 2
  let { x, y } = offset
  // In the picture's axes the frame is a turned box. Its centre may move until a corner touches the edge: check each of the four corners and
  // push back along the picture's axes. A few passes settle it, because pushing along one axis can free the other.
  const corners = [
    [frame.width / 2, frame.height / 2],
    [-frame.width / 2, frame.height / 2],
    [frame.width / 2, -frame.height / 2],
    [-frame.width / 2, -frame.height / 2],
  ] as const
  for (let pass = 0; pass < 24; pass++) {
    let moved = false
    for (const [cx, cy] of corners) {
      // the corner in the picture's axes, relative to the picture's centre: x along (cos, sin), y along (-sin, cos)
      const rx = cx - x
      const ry = cy - y
      const px = rx * cos + ry * sin
      const py = -rx * sin + ry * cos
      const overX = Math.abs(px) - halfW
      const overY = Math.abs(py) - halfH
      if (overX > 1e-9) {
        const d = Math.sign(px) * overX
        x += d * cos
        y += d * sin
        moved = true
      }
      if (overY > 1e-9) {
        const d = Math.sign(py) * overY
        x -= d * sin
        y += d * cos
        moved = true
      }
    }
    if (!moved) break
  }
  return { x, y }
}

/** The part of the original picture inside the frame. */
export function cropArea(image: { width: number; height: number }, frame: { width: number; height: number }, crop: Crop, baseScale: number): CropArea {
  const scale = baseScale * crop.zoom
  const t = rad(crop.rotation)
  const cos = Math.abs(Math.cos(t))
  const sin = Math.abs(Math.sin(t))
  const boxW = (frame.width * cos + frame.height * sin) / scale
  const boxH = (frame.width * sin + frame.height * cos) / scale
  // the frame's centre in the picture's own pixels
  const c = Math.cos(rad(crop.rotation))
  const s = Math.sin(rad(crop.rotation))
  const px = (-crop.x * c - crop.y * s) / scale
  const py = (crop.x * s - crop.y * c) / scale
  const cx = image.width / 2 + px
  const cy = image.height / 2 + py
  return { x: Math.round(cx - boxW / 2), y: Math.round(cy - boxH / 2), width: Math.round(boxW), height: Math.round(boxH) }
}

/** The canvas transform that draws the cropped picture at `outWidth` pixels across: translate, rotate, scale, in that order. */
export function cropTransform(frame: { width: number; height: number }, crop: Crop, baseScale: number, outWidth: number) {
  const k = outWidth / frame.width
  return { outWidth, outHeight: Math.round(frame.height * k), translateX: (frame.width / 2 + crop.x) * k, translateY: (frame.height / 2 + crop.y) * k, rotation: rad(crop.rotation), scale: baseScale * crop.zoom * k }
}

/** Draws the crop to a canvas and returns it as a file. The picture must be same-origin or served with CORS headers. */
export async function cropImage(image: HTMLImageElement, frame: { width: number; height: number }, crop: Crop, baseScale: number, options: CropImageOptions = {}): Promise<Blob> {
  const { maxWidth = 2048, type = "image/png", quality = 0.92, round = false, background = "rgb(255, 255, 255)" } = options
  const natural = baseScale * crop.zoom
  const width = Math.round(clamp(options.width ?? frame.width / natural, 1, maxWidth))
  const t = cropTransform(frame, crop, baseScale, width)
  const canvas = document.createElement("canvas")
  canvas.width = t.outWidth
  canvas.height = t.outHeight
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("A canvas is not available.")
  if (type === "image/jpeg") {
    ctx.fillStyle = background
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  if (round) {
    ctx.beginPath()
    ctx.ellipse(canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2, 0, 0, Math.PI * 2)
    ctx.clip()
  }
  ctx.imageSmoothingQuality = "high"
  ctx.translate(t.translateX, t.translateY)
  ctx.rotate(t.rotation)
  ctx.scale(t.scale, t.scale)
  ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2)
  return new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("The picture could not be made."))), type, quality)
    } catch (e) {
      reject(e instanceof Error ? e : new Error(String(e)))
    }
  })
}

// ------------------------------------------------------------------------------------------------- component

const START: Crop = { x: 0, y: 0, zoom: 1, rotation: 0 }
const STEP = 10

/**
 * Crops a picture with a frame that stays still while the picture moves under it: drag to move, wheel, pinch or slider to zoom, a slider to straighten
 * and buttons to turn it a quarter. The frame can be any shape from `aspect`, and `toBlob` gives you the result as a file. Every control has a key.
 */
function ImageCropper({
  src,
  aspect = 1,
  shape = "rect",
  value,
  defaultValue,
  onCropChange,
  onCropComplete,
  maxZoom = 4,
  height = 320,
  grid = true,
  zoomOnWheel = true,
  controls = true,
  alt,
  crossOrigin = "anonymous",
  onError,
  className,
  cropperRef,
  ...props
}: ImageCropperProps) {
  const msg = useMessages()
  const id = React.useId()
  const box = React.useRef<HTMLDivElement>(null)
  const img = React.useRef<HTMLImageElement>(null)
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading")
  const [natural, setNatural] = React.useState({ width: 0, height: 0 })
  const [size, setSize] = React.useState({ width: 480, height })
  const [inner, setInner] = React.useState<Crop>({ ...START, ...defaultValue })
  const crop = value ?? inner
  const [dragging, setDragging] = React.useState(false)
  const [spoken, setSpoken] = React.useState("")
  const [attempt, setAttempt] = React.useState(0)
  const pointers = React.useRef(new Map<number, { x: number; y: number }>())
  const pinch = React.useRef<{ distance: number; zoom: number } | null>(null)
  const onCompleteRef = React.useRef(onCropComplete)
  onCompleteRef.current = onCropComplete

  React.useEffect(() => {
    setStatus("loading")
    // A picture that finished loading before this page was hydrated has already fired its load event, so ask it. It is ready if it has a size,
    // and has failed if it finished with none.
    const el = img.current
    if (el?.complete && src) {
      if (el.naturalWidth > 0) {
        setNatural({ width: el.naturalWidth, height: el.naturalHeight })
        setStatus("ready")
      } else setStatus("error")
    }
  }, [src, attempt])

  // the box's width is whatever the page gives it
  React.useEffect(() => {
    const el = box.current
    if (!el || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(() => setSize({ width: el.clientWidth || 480, height: el.clientHeight || height }))
    ro.observe(el)
    setSize({ width: el.clientWidth || 480, height: el.clientHeight || height })
    return () => ro.disconnect()
  }, [height])

  // the frame: the biggest box of this shape that fits with some air around it
  const frame = React.useMemo(() => {
    const room = { width: Math.max(size.width - 32, 40), height: Math.max(size.height - 32, 40) }
    const w = Math.min(room.width, room.height * aspect)
    return { width: Math.round(w), height: Math.round(w / aspect) }
  }, [size, aspect])

  const base = natural.width ? coverScale(natural, frame, crop.rotation) : 1
  const scale = base * crop.zoom

  const set = React.useCallback(
    (next: Partial<Crop>, done = false) => {
      const zoom = clamp(next.zoom ?? crop.zoom, 1, maxZoom)
      const rotation = next.rotation ?? crop.rotation
      const b = natural.width ? coverScale(natural, frame, rotation) : 1
      const kept = natural.width ? clampOffset({ x: next.x ?? crop.x, y: next.y ?? crop.y }, natural, frame, b * zoom, rotation) : { x: 0, y: 0 }
      const out: Crop = { x: kept.x, y: kept.y, zoom, rotation }
      if (value === undefined) setInner(out)
      onCropChange?.(out)
      if (done && natural.width) onCompleteRef.current?.({ crop: out, area: cropArea(natural, frame, out, b), frame })
    },
    [crop, frame, natural, maxZoom, value, onCropChange]
  )

  // the frame or the picture changed size: keep the picture over it
  React.useEffect(() => {
    if (status === "ready") set({}, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame.width, frame.height, natural.width, status])

  React.useImperativeHandle(
    cropperRef,
    () => ({
      getCrop: () => (natural.width ? { crop, area: cropArea(natural, frame, crop, base), frame } : null),
      toBlob: (options) => {
        const el = img.current
        if (!el || !natural.width) return Promise.reject(new Error("The picture has not loaded yet."))
        return cropImage(el, frame, crop, base, { round: shape === "round", ...options })
      },
      reset: () => set({ ...START }, true),
    }),
    [natural, crop, frame, base, shape, set]
  )

  // ----- pointer: drag to move, two fingers to zoom
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (status !== "ready") return
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    setDragging(true)
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinch.current = { distance: Math.hypot(a!.x - b!.x, a!.y - b!.y), zoom: crop.zoom }
    }
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const prev = pointers.current.get(e.pointerId)
    if (!prev) return
    const now = { x: e.clientX, y: e.clientY }
    pointers.current.set(e.pointerId, now)
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()]
      const d = Math.hypot(a!.x - b!.x, a!.y - b!.y)
      set({ zoom: pinch.current.zoom * (d / pinch.current.distance) })
      return
    }
    if (pointers.current.size === 1) set({ x: crop.x + (now.x - prev.x), y: crop.y + (now.y - prev.y) })
  }
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.delete(e.pointerId)) return
    pinch.current = null
    if (pointers.current.size === 0) {
      setDragging(false)
      set({}, true)
    }
  }
  const wheel = React.useRef({ zoomOnWheel, set, crop })
  wheel.current = { zoomOnWheel, set, crop }
  React.useEffect(() => {
    const el = box.current
    if (!el) return
    let t: ReturnType<typeof setTimeout> | undefined
    const onWheel = (e: WheelEvent) => {
      if (!wheel.current.zoomOnWheel || status !== "ready") return
      e.preventDefault()
      wheel.current.set({ zoom: wheel.current.crop.zoom * Math.exp(-e.deltaY * 0.0015) })
      clearTimeout(t)
      t = setTimeout(() => wheel.current.set({}, true), 150)
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => {
      el.removeEventListener("wheel", onWheel)
      clearTimeout(t)
    }
  }, [status])

  // ----- keyboard
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (status !== "ready" || e.target !== e.currentTarget) return
    const step = e.shiftKey ? STEP * 4 : STEP
    let handled = true
    switch (e.key) {
      case "ArrowLeft": set({ x: crop.x + step }, true); break
      case "ArrowRight": set({ x: crop.x - step }, true); break
      case "ArrowUp": set({ y: crop.y + step }, true); break
      case "ArrowDown": set({ y: crop.y - step }, true); break
      case "+":
      case "=": zoomBy(1.1); break
      case "-":
      case "_": zoomBy(1 / 1.1); break
      case "[": turn(-90); break
      case "]": turn(90); break
      case "0": set({ ...START }, true); setSpoken(msg("image-cropper.resetDone", "Reset")); break
      default: handled = false
    }
    if (handled) e.preventDefault()
  }
  const zoomBy = (f: number) => {
    const zoom = clamp(crop.zoom * f, 1, maxZoom)
    set({ zoom }, true)
    setSpoken(msg("image-cropper.zoomSpoken", "Zoom {percent}%", { percent: Math.round(zoom * 100) }))
  }
  const turn = (deg: number) => {
    const rotation = crop.rotation + deg
    set({ rotation }, true)
    setSpoken(msg("image-cropper.rotationSpoken", "Rotated to {degrees} degrees", { degrees: ((Math.round(rotation) % 360) + 360) % 360 }))
  }

  // the straighten slider moves within a quarter turn either side of the nearest quarter
  const quarter = Math.round(crop.rotation / 90) * 90
  const fine = clamp(crop.rotation - quarter, -45, 45)

  const showGrid = grid && status === "ready"
  const round = shape === "round"
  const transform = `translate(calc(-50% + ${crop.x}px), calc(-50% + ${crop.y}px)) rotate(${crop.rotation}deg) scale(${scale})`

  return (
    <div data-slot="image-cropper" className={cn("min-w-0", className)} {...props}>
      <div
        ref={box}
        role="group"
        tabIndex={status === "ready" ? 0 : -1}
        aria-roledescription={msg("image-cropper.role", "image cropper")}
        aria-label={alt ?? msg("image-cropper.label", "Crop the picture")}
        aria-describedby={`${id}-help`}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        data-dragging={dragging || undefined}
        data-state={status}
        className={cn(
          "relative touch-none select-none overflow-hidden rounded-xl bg-muted outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          status === "ready" && (dragging ? "cursor-grabbing" : "cursor-grab")
        )}
        style={{ height }}
      >
        {/* the picture, centred, then moved, turned and scaled; its size is its own until the scale is applied */}
        {src ? (
        <img
          key={`${src}-${attempt}`}
          ref={img}
          src={src}
          alt=""
          draggable={false}
          crossOrigin={crossOrigin || undefined}
          onLoad={(e) => {
            const el = e.currentTarget
            setNatural({ width: el.naturalWidth, height: el.naturalHeight })
            setStatus("ready")
          }}
          onError={() => {
            setStatus("error")
            onError?.(new Error(`The picture ${src} could not be loaded.`))
          }}
          className="pointer-events-none absolute left-1/2 top-1/2 max-w-none origin-center will-change-transform"
          style={{ width: natural.width || undefined, height: natural.height || undefined, transform, opacity: status === "ready" ? 1 : 0 }}
        />
        ) : null}

        {status === "ready" ? (
          <>
            {/* the dimmed picture outside the frame, and the frame itself */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                data-slot="image-cropper-frame"
                className={cn("relative ring-2 ring-white/90 [box-shadow:0_0_0_9999px_rgb(0_0_0/0.55)]", round ? "rounded-full" : "rounded-sm")}
                style={{ width: frame.width, height: frame.height }}
              >
                {showGrid ? (
                  <div className={cn("absolute inset-0 overflow-hidden transition-opacity duration-150 motion-reduce:transition-none", dragging ? "opacity-100" : "opacity-0", round && "rounded-full")}>
                    <div className="absolute inset-y-0 start-1/3 w-px bg-white/60" />
                    <div className="absolute inset-y-0 start-2/3 w-px bg-white/60" />
                    <div className="absolute inset-x-0 top-1/3 h-px bg-white/60" />
                    <div className="absolute inset-x-0 top-2/3 h-px bg-white/60" />
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : null}

        {status === "loading" ? (
          <div role="status" className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="absolute inset-4 rounded-lg" />
            <span className="sr-only">{msg("image-cropper.loading", "Loading the picture")}</span>
          </div>
        ) : null}
        {status === "error" ? (
          <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
            <ImageOff className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium">{msg("image-cropper.errorTitle", "The picture could not be loaded")}</p>
            <Button type="button" size="sm" variant="outline" onClick={() => setAttempt((n) => n + 1)}>
              {msg("image-cropper.retry", "Try again")}
            </Button>
          </div>
        ) : null}
      </div>

      <p id={`${id}-help`} className="sr-only">
        {msg("image-cropper.help", "Arrow keys move the picture. Plus and minus zoom. The square brackets turn it a quarter. Zero resets.")}
      </p>

      {controls ? (
        <div data-slot="image-cropper-controls" className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <ZoomOut className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                type="range"
                aria-label={msg("image-cropper.zoom", "Zoom")}
                aria-valuetext={msg("image-cropper.zoomValue", "{percent}%", { percent: Math.round(crop.zoom * 100) })}
                min={1}
                max={maxZoom}
                step={0.01}
                value={crop.zoom}
                disabled={status !== "ready"}
                onChange={(e) => set({ zoom: Number(e.target.value) })}
                onPointerUp={() => set({}, true)}
                onKeyUp={() => set({}, true)}
                className="h-1.5 w-full min-w-0 cursor-pointer accent-primary disabled:opacity-50"
              />
              <ZoomIn className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                type="range"
                aria-label={msg("image-cropper.straighten", "Straighten")}
                aria-valuetext={msg("image-cropper.degrees", "{degrees} degrees", { degrees: Math.round(fine) })}
                min={-45}
                max={45}
                step={0.5}
                value={fine}
                disabled={status !== "ready"}
                onChange={(e) => set({ rotation: quarter + Number(e.target.value) })}
                onPointerUp={() => set({}, true)}
                onKeyUp={() => set({}, true)}
                className="h-1.5 w-full min-w-0 cursor-pointer accent-primary disabled:opacity-50"
              />
              <RotateCw className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button type="button" variant="outline" size="icon" aria-label={msg("image-cropper.rotateLeft", "Turn left")} title={msg("image-cropper.rotateLeft", "Turn left")} disabled={status !== "ready"} onClick={() => turn(-90)}>
              <RotateCcw className="rtl:-scale-x-100" aria-hidden="true" />
            </Button>
            <Button type="button" variant="outline" size="icon" aria-label={msg("image-cropper.rotateRight", "Turn right")} title={msg("image-cropper.rotateRight", "Turn right")} disabled={status !== "ready"} onClick={() => turn(90)}>
              <RotateCw className="rtl:-scale-x-100" aria-hidden="true" />
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled={status !== "ready"} onClick={() => (set({ ...START }, true), setSpoken(msg("image-cropper.resetDone", "Reset")))}>
              {msg("image-cropper.reset", "Reset")}
            </Button>
          </div>
        </div>
      ) : null}
      <span className="sr-only" role="status" aria-live="polite">
        {spoken}
      </span>
    </div>
  )
}

export { ImageCropper, type Crop, type CropArea, type CropImageOptions, type CropResult, type ImageCropperHandle, type ImageCropperProps }
