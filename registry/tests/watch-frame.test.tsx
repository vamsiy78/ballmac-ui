import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WatchFrame } from "@/components/ballmac/watch-frame";

describe("WatchFrame", () => {
  it("renders children on an always dark screen", () => {
    const { container } = render(<WatchFrame><p>12:00</p></WatchFrame>);
    expect(screen.getByText("12:00")).toBeInTheDocument();
    expect(container.querySelector("[data-slot=watch-frame-screen]")?.className).toContain("dark");
  });
  it("draws two straps unless band is none", () => {
    const { container, rerender } = render(<WatchFrame />);
    expect(container.querySelectorAll("[data-slot=watch-frame-band]")).toHaveLength(2);
    rerender(<WatchFrame band="none" />);
    expect(container.querySelectorAll("[data-slot=watch-frame-band]")).toHaveLength(0);
  });
  it("scales content from screenWidth and supports media", () => {
    const { rerender } = render(<WatchFrame screenWidth={208}><p>face</p></WatchFrame>);
    expect((screen.getByText("face").parentElement as HTMLElement).style.width).toBe("208px");
    rerender(<WatchFrame src="/face.png" alt="Face" />);
    expect(screen.getByRole("img", { name: "Face" })).toBeInTheDocument();
  });
  it("keeps decoration out of the accessibility tree", () => {
    const { container } = render(<WatchFrame />);
    for (const el of container.querySelectorAll("[data-slot=watch-frame-band]")) expect(el).toHaveAttribute("aria-hidden", "true");
  });
});
