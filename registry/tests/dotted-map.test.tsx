import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => motion.reduce }));

import { DottedMap } from "@/components/ballmac/dotted-map";

afterEach(() => {
  motion.reduce = false;
});

const land = (c: HTMLElement) => c.querySelector("svg > path")!.getAttribute("d")!;

describe("DottedMap", () => {
  it("is an image whose name lists the labelled places", () => {
    render(<DottedMap markers={[{ lat: 51.5, lng: -0.12, label: "London" }, { lat: 35.68, lng: 139.65, label: "Tokyo" }, { lat: 0, lng: 0 }]} />);
    expect(screen.getByRole("img", { name: "World map: London, Tokyo" })).toBeInTheDocument();
  });
  it("draws land as dots and more dots for a finer map", () => {
    const a = render(<DottedMap dots={60} />).container as HTMLElement;
    const b = render(<DottedMap dots={140} />).container as HTMLElement;
    const count = (d: string) => (d.match(/M/g) ?? []).length;
    expect(count(land(a))).toBeGreaterThan(300);
    expect(count(land(b))).toBeGreaterThan(count(land(a)) * 3);
  });
  it("puts land where there is land and water where there is water", () => {
    const { container } = render(<DottedMap dots={200} />);
    const dots = Array.from(land(container as HTMLElement).matchAll(/M([\d.]+) ([\d.]+)h0/g)).map((m) => [Number(m[1]), Number(m[2])]);
    const near = (x: number, y: number, r = 6) => dots.some(([dx, dy]) => Math.hypot(dx! - x, dy! - y) < r);
    const height = (1000 * (73 - -56)) / 360;
    const at = (lat: number, lng: number): [number, number] => [((lng + 180) / 360) * 1000, ((73 - lat) / (73 + 56)) * height];
    expect(near(...at(39, -100))).toBe(true); // United States
    expect(near(...at(-10, -55))).toBe(true); // Brazil
    expect(near(...at(28, 15))).toBe(true); // Sahara
    expect(near(...at(0, -150), 12)).toBe(false); // Pacific
  });
  it("draws markers, routes and optional labels", () => {
    const { container } = render(
      <DottedMap
        labels
        markers={[{ lat: 51.5, lng: -0.12, label: "London" }, { lat: 40.7, lng: -74, label: "New York" }]}
        arcs={[{ from: [51.5, -0.12], to: [40.7, -74] }]}
      />
    );
    expect(container.querySelectorAll("svg circle[stroke]")).toHaveLength(2);
    expect(container.querySelectorAll("svg g path")).toHaveLength(2);
    expect(screen.getByText("London")).toBeInTheDocument();
  });
  it("keeps markers and routes still under reduced motion", () => {
    motion.reduce = true;
    const { container } = render(<DottedMap markers={[{ lat: 10, lng: 10 }]} arcs={[{ from: [0, 0], to: [10, 10] }]} />);
    expect(container.querySelectorAll("svg circle")).toHaveLength(1);
  });
});
