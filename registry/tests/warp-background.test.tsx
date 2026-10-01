import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WarpBackground } from "@/components/ballmac/warp-background";

const calls: string[] = [];
beforeEach(() => {
  calls.length = 0;
  const ctx = new Proxy({}, { get: () => (...args: unknown[]) => void calls.push(String(args.length)), set: () => true });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
});
afterEach(() => vi.restoreAllMocks());

describe("WarpBackground", () => {
  it("shows its children on a layer above the decorative canvas", () => {
    const { container } = render(
      <WarpBackground>
        <h2>Launching soon</h2>
      </WarpBackground>
    );
    expect(screen.getByRole("heading", { name: "Launching soon" })).toBeInTheDocument();
    expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("heading").parentElement).toHaveClass("z-10");
  });
  it("can drop the vignette", () => {
    const { container } = render(<WarpBackground vignette={false}>x</WarpBackground>);
    expect(container.querySelectorAll("[data-slot=warp-background] > span")).toHaveLength(0);
  });
  it("starts and stops its animation frame cleanly", () => {
    const cancel = vi.spyOn(window, "cancelAnimationFrame");
    const { unmount } = render(<WarpBackground>x</WarpBackground>);
    unmount();
    expect(cancel).toHaveBeenCalled();
  });
});
