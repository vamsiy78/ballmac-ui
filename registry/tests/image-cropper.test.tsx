import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { clampOffset, coverScale, cropArea, cropTransform, ImageCropper, type Crop, type ImageCropperHandle, type ImageCropperProps } from "@/components/ballmac/image-cropper"

const near = (a: number, b: number, d = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(d)

describe("crop geometry", () => {
  const image = { width: 1600, height: 1000 }
  const frame = { width: 200, height: 200 }

  it("covers the frame at the smallest scale", () => {
    near(coverScale(image, frame, 0), 0.2) // the short side of the picture fills the frame
    near(coverScale({ width: 1000, height: 1600 }, frame, 0), 0.2)
    near(coverScale(image, { width: 320, height: 200 }, 0), 0.2)
  })

  it("needs a larger scale to cover a frame once the picture is turned", () => {
    const straight = coverScale(image, frame, 0)
    expect(coverScale(image, frame, 20)).toBeGreaterThan(straight)
    near(coverScale(image, frame, 90), coverScale(image, frame, 270))
    // a quarter turn swaps the picture's sides
    near(coverScale(image, frame, 90), 200 / 1000)
    // 45 degrees: the frame's diagonal has to fit across the picture's shorter side
    near(coverScale({ width: 1000, height: 1000 }, frame, 45), (200 * Math.SQRT2) / 1000, 1e-6)
  })

  it("keeps the picture over the frame", () => {
    const scale = coverScale(image, frame, 0)
    // the picture is 320 wide at this scale, so it can move 60 either way and no more
    expect(clampOffset({ x: 500, y: 0 }, image, frame, scale, 0)).toEqual({ x: 60, y: 0 })
    expect(clampOffset({ x: -500, y: 0 }, image, frame, scale, 0)).toEqual({ x: -60, y: 0 })
    expect(clampOffset({ x: 10, y: 500 }, image, frame, scale, 0)).toEqual({ x: 10, y: 0 })
    expect(clampOffset({ x: 20, y: -20 }, image, frame, scale, 0)).toEqual({ x: 20, y: 0 }) // no room to move up or down
    expect(clampOffset({ x: 20, y: -20 }, image, frame, scale * 1.5, 0)).toEqual({ x: 20, y: -20 })
  })

  it("keeps it over the frame when turned, too", () => {
    for (const rotation of [15, 30, 45, 90, 135, 200]) {
      const scale = coverScale(image, frame, rotation) * 1.3
      const t = (rotation * Math.PI) / 180
      for (const raw of [{ x: 900, y: 900 }, { x: -900, y: 400 }, { x: 0, y: -700 }]) {
        const o = clampOffset(raw, image, frame, scale, rotation)
        // every corner of the frame must now be inside the turned picture
        for (const [cx, cy] of [[100, 100], [-100, 100], [100, -100], [-100, -100]]) {
          const rx = cx - o.x
          const ry = cy - o.y
          const px = rx * Math.cos(t) + ry * Math.sin(t)
          const py = -rx * Math.sin(t) + ry * Math.cos(t)
          expect(Math.abs(px)).toBeLessThanOrEqual((image.width * scale) / 2 + 0.01)
          expect(Math.abs(py)).toBeLessThanOrEqual((image.height * scale) / 2 + 0.01)
        }
      }
    }
  })

  it("reports the area of the original that is inside the frame", () => {
    const base = coverScale(image, frame, 0)
    const centred: Crop = { x: 0, y: 0, zoom: 1, rotation: 0 }
    expect(cropArea(image, frame, centred, base)).toEqual({ x: 300, y: 0, width: 1000, height: 1000 })
    // moving the picture right shows the left of it
    expect(cropArea(image, frame, { ...centred, x: 20 }, base).x).toBe(200)
    // zooming in halves the area
    expect(cropArea(image, frame, { ...centred, zoom: 2 }, base)).toEqual({ x: 550, y: 250, width: 500, height: 500 })
  })

  it("gives the canvas transform for an export", () => {
    const base = coverScale(image, frame, 0)
    const t = cropTransform(frame, { x: 10, y: -4, zoom: 2, rotation: 90 }, base, 400)
    expect(t.outWidth).toBe(400)
    expect(t.outHeight).toBe(400)
    near(t.translateX, (100 + 10) * 2)
    near(t.translateY, (100 - 4) * 2)
    near(t.rotation, Math.PI / 2)
    near(t.scale, base * 2 * 2)
    expect(cropTransform({ width: 320, height: 180 }, { x: 0, y: 0, zoom: 1, rotation: 0 }, 1, 640).outHeight).toBe(360)
  })
})

function Cropper(props: Partial<ImageCropperProps>) {
  return <ImageCropper src="/photo.jpg" crossOrigin="" height={300} {...props} />
}

/** jsdom never loads pictures. Say this one did, at this size. */
function loadImage(w = 1600, h = 1000) {
  const img = document.querySelector("img")!
  Object.defineProperty(img, "naturalWidth", { value: w, configurable: true })
  Object.defineProperty(img, "naturalHeight", { value: h, configurable: true })
  fireEvent.load(img)
}

describe("ImageCropper", () => {
  it("loads, then offers the controls", async () => {
    render(<Cropper />)
    expect(screen.getByText("Loading the picture")).toBeInTheDocument()
    expect(screen.getByRole("slider", { name: "Zoom" })).toBeDisabled()
    act(() => loadImage())
    await waitFor(() => expect(screen.getByRole("slider", { name: "Zoom" })).toBeEnabled())
    expect(screen.getByRole("group", { name: "Crop the picture" })).toHaveAttribute("aria-roledescription", "image cropper")
    expect(screen.getByRole("group")).toHaveAttribute("tabindex", "0")
  })

  it("says when the picture cannot be loaded, and tries again", async () => {
    const user = userEvent.setup()
    const onError = vi.fn()
    render(<Cropper onError={onError} />)
    fireEvent.error(document.querySelector("img")!)
    expect(await screen.findByRole("alert")).toHaveTextContent("The picture could not be loaded")
    expect(onError).toHaveBeenCalledWith(expect.any(Error))
    await user.click(screen.getByRole("button", { name: "Try again" }))
    expect(screen.getByText("Loading the picture")).toBeInTheDocument()
  })

  it("holds its place when there is no picture yet", () => {
    render(<Cropper src="" />)
    expect(screen.getByText("Loading the picture")).toBeInTheDocument()
    expect(document.querySelector("img")).toBeNull()
  })

  it("moves the picture with the arrow keys, within what it can", async () => {
    const user = userEvent.setup()
    const onCropChange = vi.fn()
    render(<Cropper onCropChange={onCropChange} aspect={1} />)
    act(() => loadImage())
    const box = screen.getByRole("group")
    box.focus()
    // the picture is wider than the frame, so it can move sideways but not up or down at the start
    await user.keyboard("{ArrowLeft}")
    expect(onCropChange.mock.calls.at(-1)![0].x).toBe(10)
    await user.keyboard("{ArrowDown}")
    expect(onCropChange.mock.calls.at(-1)![0].y).toBe(0)
    await user.keyboard("{Shift>}{ArrowRight}{/Shift}")
    expect(onCropChange.mock.calls.at(-1)![0].x).toBe(-30)
  })

  it("zooms with + and -, within limits, and says so", async () => {
    const user = userEvent.setup()
    const onCropChange = vi.fn()
    render(<Cropper onCropChange={onCropChange} maxZoom={2} />)
    act(() => loadImage())
    screen.getByRole("group").focus()
    await user.keyboard("+")
    expect(onCropChange.mock.calls.at(-1)![0].zoom).toBeCloseTo(1.1)
    expect(screen.getByText("Zoom 110%")).toBeInTheDocument()
    for (let i = 0; i < 12; i++) await user.keyboard("+")
    expect(onCropChange.mock.calls.at(-1)![0].zoom).toBe(2)
    for (let i = 0; i < 20; i++) await user.keyboard("-")
    expect(onCropChange.mock.calls.at(-1)![0].zoom).toBe(1)
  })

  it("turns a quarter with the brackets and the buttons, and resets", async () => {
    const user = userEvent.setup()
    const onCropChange = vi.fn()
    render(<Cropper onCropChange={onCropChange} />)
    act(() => loadImage())
    screen.getByRole("group").focus()
    await user.keyboard("]")
    expect(onCropChange.mock.calls.at(-1)![0].rotation).toBe(90)
    expect(screen.getByText("Rotated to 90 degrees")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Turn left" }))
    await user.click(screen.getByRole("button", { name: "Turn left" }))
    expect(onCropChange.mock.calls.at(-1)![0].rotation).toBe(-90)
    await user.click(screen.getByRole("button", { name: "Reset" }))
    expect(onCropChange.mock.calls.at(-1)![0]).toEqual({ x: 0, y: 0, zoom: 1, rotation: 0 })
  })

  it("zooms and straightens with the sliders", () => {
    const onCropChange = vi.fn()
    render(<Cropper onCropChange={onCropChange} />)
    act(() => loadImage())
    fireEvent.change(screen.getByRole("slider", { name: "Zoom" }), { target: { value: "2.5" } })
    expect(onCropChange.mock.calls.at(-1)![0].zoom).toBe(2.5)
    expect(screen.getByRole("slider", { name: "Zoom" })).toHaveAttribute("aria-valuetext", "250%")
    fireEvent.change(screen.getByRole("slider", { name: "Straighten" }), { target: { value: "-12" } })
    expect(onCropChange.mock.calls.at(-1)![0].rotation).toBe(-12)
    expect(screen.getByRole("slider", { name: "Straighten" })).toHaveAttribute("aria-valuetext", "-12 degrees")
  })

  it("straightens around the nearest quarter turn", async () => {
    const user = userEvent.setup()
    const onCropChange = vi.fn()
    render(<Cropper onCropChange={onCropChange} />)
    act(() => loadImage())
    await user.click(screen.getByRole("button", { name: "Turn right" }))
    fireEvent.change(screen.getByRole("slider", { name: "Straighten" }), { target: { value: "10" } })
    expect(onCropChange.mock.calls.at(-1)![0].rotation).toBe(100)
  })

  it("moves with the pointer, and reports the area when it lets go", () => {
    const onCropComplete = vi.fn()
    const onCropChange = vi.fn()
    render(<Cropper onCropComplete={onCropComplete} onCropChange={onCropChange} />)
    act(() => loadImage())
    const box = screen.getByRole("group")
    fireEvent.pointerDown(box, { pointerId: 1, clientX: 200, clientY: 100, button: 0 })
    fireEvent.pointerMove(box, { pointerId: 1, clientX: 150, clientY: 100 })
    expect(onCropChange.mock.calls.at(-1)![0].x).toBeLessThan(0)
    expect(box).toHaveAttribute("data-dragging")
    fireEvent.pointerUp(box, { pointerId: 1, clientX: 150, clientY: 100 })
    expect(box).not.toHaveAttribute("data-dragging")
    expect(onCropComplete).toHaveBeenCalledTimes(1)
    const result = onCropComplete.mock.calls[0]![0]
    expect(result.area.width).toBe(result.area.height) // a square frame
    expect(result.area.x).toBeGreaterThan(300) // moved the picture left, so the frame shows more of the right
  })

  it("zooms with two fingers", () => {
    const onCropChange = vi.fn()
    render(<Cropper onCropChange={onCropChange} />)
    act(() => loadImage())
    const box = screen.getByRole("group")
    fireEvent.pointerDown(box, { pointerId: 1, clientX: 100, clientY: 100, button: 0 })
    fireEvent.pointerDown(box, { pointerId: 2, clientX: 200, clientY: 100, button: 0 })
    fireEvent.pointerMove(box, { pointerId: 2, clientX: 300, clientY: 100 })
    expect(onCropChange.mock.calls.at(-1)![0].zoom).toBeCloseTo(2)
  })

  it("holds the crop in your state when it is controlled", async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [crop, setCrop] = React.useState<Crop>({ x: 0, y: 0, zoom: 1.5, rotation: 0 })
      return (
        <>
          <Cropper value={crop} onCropChange={setCrop} />
          <output>{crop.zoom.toFixed(2)}</output>
        </>
      )
    }
    render(<Controlled />)
    act(() => loadImage())
    expect(screen.getByRole("slider", { name: "Zoom" })).toHaveValue("1.5")
    screen.getByRole("group").focus()
    await user.keyboard("+")
    expect(screen.getByText("1.65")).toBeInTheDocument()
  })

  it("hides the controls when asked", () => {
    render(<Cropper controls={false} />)
    expect(screen.queryByRole("slider")).toBeNull()
  })

  it("gives the crop through the ref, and refuses to export before the picture has loaded", async () => {
    const ref = React.createRef<ImageCropperHandle>()
    render(<Cropper cropperRef={ref} />)
    expect(ref.current!.getCrop()).toBeNull()
    await expect(ref.current!.toBlob()).rejects.toThrow("not loaded")
    act(() => loadImage())
    await waitFor(() => expect(ref.current!.getCrop()).not.toBeNull())
    const got = ref.current!.getCrop()!
    expect(got.crop).toEqual({ x: 0, y: 0, zoom: 1, rotation: 0 })
    expect(got.frame.width).toBe(got.frame.height)
  })

  it("draws the crop to a canvas for the file", async () => {
    const calls: unknown[][] = []
    const ctx = new Proxy({} as Record<string, unknown>, { get: (t, k: string) => (k in t ? t[k] : (...a: unknown[]) => void calls.push([k, ...a])), set: (t, k: string, v) => ((t[k] = v), true) })
    const make = document.createElement.bind(document)
    const spy = vi.spyOn(document, "createElement").mockImplementation(((tag: string) => {
      if (tag !== "canvas") return make(tag)
      return { width: 0, height: 0, getContext: () => ctx, toBlob: (cb: (b: Blob) => void) => cb(new Blob(["x"], { type: "image/png" })) } as unknown as HTMLCanvasElement
    }) as never)
    const ref = React.createRef<ImageCropperHandle>()
    render(<Cropper cropperRef={ref} shape="round" />)
    act(() => loadImage())
    await waitFor(() => expect(ref.current!.getCrop()).not.toBeNull())
    const blob = await ref.current!.toBlob({ width: 300 })
    expect(blob.type).toBe("image/png")
    const names = calls.map((c) => c[0])
    expect(names).toEqual(expect.arrayContaining(["ellipse", "clip", "translate", "rotate", "scale", "drawImage"]))
    expect(names.indexOf("clip")).toBeLessThan(names.indexOf("drawImage")) // the round cut is made before the picture is drawn
    spy.mockRestore()
  })
})

describe("ImageCropper on a server-rendered page", () => {
  it("picks up a picture that finished loading before the page was hydrated", async () => {
    const complete = vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true)
    const w = vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(800)
    const h = vi.spyOn(HTMLImageElement.prototype, "naturalHeight", "get").mockReturnValue(600)
    render(<Cropper />)
    await waitFor(() => expect(screen.getByRole("slider", { name: "Zoom" })).toBeEnabled())
    complete.mockRestore()
    w.mockRestore()
    h.mockRestore()
  })
  it("sees a picture that failed before the page was hydrated", async () => {
    const complete = vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true)
    render(<Cropper />)
    expect(await screen.findByRole("alert")).toHaveTextContent("The picture could not be loaded")
    complete.mockRestore()
  })
})
