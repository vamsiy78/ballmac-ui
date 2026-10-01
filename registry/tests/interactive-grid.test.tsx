import { fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InteractiveGrid } from "@/components/ballmac/interactive-grid";

const calls: string[] = [];
beforeEach(() => {
  calls.length = 0;
  const ctx = new Proxy({}, { get: (_, prop) => (prop === "canvas" ? null : (...args: unknown[]) => void calls.push(String(prop) + args.length)), set: () => true });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, value: 360 });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, value: 180 });
});
afterEach(() => {
  vi.restoreAllMocks();
  delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientWidth;
  delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientHeight;
});

describe("InteractiveGrid", () => {
  it("is a decorative canvas that ignores the pointer itself", () => {
    const { container } = render(<InteractiveGrid />);
    const root = container.querySelector("[data-slot=interactive-grid]")!;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).toHaveClass("pointer-events-none");
    expect(root.querySelector("canvas")).not.toBeNull();
  });
  it("draws the grid lines on mount", () => {
    render(<InteractiveGrid cell={36} />);
    expect(calls.some((c) => c.startsWith("stroke"))).toBe(true);
    expect(calls.filter((c) => c.startsWith("lineTo")).length).toBeGreaterThan(10);
  });
  it("listens on its parent, so content above does not block it, and lights cells", async () => {
    const { container } = render(
      <div data-testid="host">
        <InteractiveGrid cell={36} />
      </div>
    );
    const host = container.querySelector("[data-testid=host]")!;
    calls.length = 0;
    fireEvent.pointerMove(host, { clientX: 70, clientY: 70 });
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    expect(calls.some((c) => c.startsWith("fillRect"))).toBe(true);
  });
  it("removes its listener when it unmounts", () => {
    const { container, unmount } = render(
      <div data-testid="host">
        <InteractiveGrid />
      </div>
    );
    const host = container.querySelector("[data-testid=host]")!;
    const remove = vi.spyOn(host, "removeEventListener");
    unmount();
    expect(remove).toHaveBeenCalledWith("pointermove", expect.any(Function));
  });
});
