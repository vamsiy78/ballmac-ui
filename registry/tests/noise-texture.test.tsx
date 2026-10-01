import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => motion.reduce }));

import { NoiseTexture } from "@/components/ballmac/noise-texture";

afterEach(() => {
  motion.reduce = false;
});

const layer = (c: HTMLElement) => c.querySelector("[data-slot=noise-texture] > div") as HTMLElement;

describe("NoiseTexture", () => {
  it("is a decorative overlay", () => {
    const { container } = render(<NoiseTexture />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstElementChild).toHaveClass("pointer-events-none");
  });
  it("builds the grain from an inline SVG turbulence filter", () => {
    const { container } = render(<NoiseTexture frequency={0.5} tile={160} />);
    const image = decodeURIComponent(layer(container as HTMLElement).style.backgroundImage);
    expect(image).toContain("feTurbulence");
    expect(image).toContain("baseFrequency='0.5'");
    expect(layer(container as HTMLElement).style.backgroundSize).toBe("160px 160px");
  });
  it("applies strength and blend mode", () => {
    const { container } = render(<NoiseTexture opacity={0.3} blend="soft-light" />);
    const el = layer(container as HTMLElement);
    expect(el.style.opacity).toBe("0.3");
    expect(el.style.mixBlendMode).toBe("soft-light");
  });
  it("renders with shimmer on and under reduced motion", () => {
    motion.reduce = true;
    const { container } = render(<NoiseTexture animated />);
    expect(layer(container as HTMLElement)).toBeTruthy();
  });
});
