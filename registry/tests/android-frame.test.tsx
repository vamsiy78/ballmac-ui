import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AndroidFrame } from "@/components/ballmac/android-frame";

describe("AndroidFrame", () => {
  it("renders children, status bar time and the punch-hole camera", () => {
    const { container } = render(<AndroidFrame time="10:02"><p>Home</p></AndroidFrame>);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(container.querySelector("[data-slot=android-frame-status-bar]")).toHaveTextContent("10:02");
    expect(container.querySelector("[data-slot=android-frame-camera]")).toHaveAttribute("aria-hidden", "true");
  });
  it("chooses the navigation style", () => {
    const { container, rerender } = render(<AndroidFrame />);
    expect(container.querySelector("[data-slot=android-frame-gesture]")).toBeInTheDocument();
    rerender(<AndroidFrame navigation="buttons" />);
    expect(container.querySelector("[data-slot=android-frame-gesture]")).toBeNull();
    expect(container.querySelector("[data-slot=android-frame-buttons]")).toBeInTheDocument();
    rerender(<AndroidFrame navigation="none" />);
    expect(container.querySelector("[data-slot=android-frame-buttons]")).toBeNull();
  });
  it("exposes the variant and hides the status bar on request", () => {
    const { container } = render(<AndroidFrame variant="sage" statusBar={false} />);
    expect(container.querySelector("[data-slot=android-frame]")).toHaveAttribute("data-variant", "sage");
    expect(container.querySelector("[data-slot=android-frame-status-bar]")).toBeNull();
  });
  it("lays content out at screenWidth", () => {
    render(<AndroidFrame screenWidth={412}><p>wide</p></AndroidFrame>);
    expect((screen.getByText("wide").parentElement as HTMLElement).style.width).toBe("412px");
  });
});
