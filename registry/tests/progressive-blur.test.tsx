import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressiveBlur } from "@/components/ballmac/progressive-blur";

const layers = (c: HTMLElement) => Array.from(c.querySelectorAll("[data-slot=progressive-blur] > span")) as HTMLElement[];

describe("ProgressiveBlur", () => {
  it("is decorative and lets clicks through", () => {
    const { container } = render(<ProgressiveBlur />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstElementChild).toHaveClass("pointer-events-none");
  });
  it("stacks the requested number of layers with growing blur, up to the strength", () => {
    const { container } = render(<ProgressiveBlur layers={6} strength={12} />);
    const blurs = layers(container as HTMLElement).map((l) => parseFloat(l.style.backdropFilter.replace(/[^0-9.]/g, "")));
    expect(blurs).toHaveLength(6);
    expect([...blurs].sort((a, b) => a - b)).toEqual(blurs);
    expect(blurs[5]).toBeCloseTo(12, 1);
  });
  it("attaches to the chosen edge, strongest there", () => {
    const { container, rerender } = render(<ProgressiveBlur position="top" size="4rem" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.top).toBe("0px");
    expect(root.style.height).toBe("4rem");
    expect(layers(container as HTMLElement)[0]!.style.maskImage).toContain("to top");
    rerender(<ProgressiveBlur position="right" size="30%" />);
    expect((container.firstElementChild as HTMLElement).style.width).toBe("30%");
    expect(layers(container as HTMLElement)[0]!.style.maskImage).toContain("to right");
  });
  it("clamps the layer count", () => {
    const { container } = render(<ProgressiveBlur layers={40} />);
    expect(layers(container as HTMLElement)).toHaveLength(12);
  });
});
