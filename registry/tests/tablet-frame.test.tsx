import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TabletFrame } from "@/components/ballmac/tablet-frame";

describe("TabletFrame", () => {
  it("renders children inside the screen with a status bar and home indicator", () => {
    const { container } = render(<TabletFrame><p>Hello</p></TabletFrame>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(container.querySelector("[data-slot=tablet-frame-status-bar]")).toHaveTextContent("9:41 AM");
    expect(container.querySelector("[data-slot=tablet-frame-home-indicator]")).toHaveAttribute("aria-hidden", "true");
  });
  it("switches proportions with orientation", () => {
    const { container, rerender } = render(<TabletFrame />);
    const root = () => container.querySelector("[data-slot=tablet-frame]") as HTMLElement;
    expect(root()).toHaveAttribute("data-orientation", "landscape");
    expect(root().className).toContain("aspect-[247.6/178.5]");
    rerender(<TabletFrame orientation="portrait" />);
    expect(root().className).toContain("aspect-[178.5/247.6]");
  });
  it("hides the status bar and home indicator on request, and shows an image instead of children", () => {
    const { container } = render(<TabletFrame statusBar={false} homeIndicator={false} src="/x.png" alt="App">child</TabletFrame>);
    expect(container.querySelector("[data-slot=tablet-frame-status-bar]")).toBeNull();
    expect(container.querySelector("[data-slot=tablet-frame-home-indicator]")).toBeNull();
    expect(screen.getByRole("img", { name: "App" })).toBeInTheDocument();
    expect(screen.queryByText("child")).toBeNull();
  });
  it("lays content out at screenWidth", () => {
    const { container } = render(<TabletFrame screenWidth={1194}><p>wide</p></TabletFrame>);
    const wrapper = screen.getByText("wide").parentElement as HTMLElement;
    expect(wrapper.style.width).toBe("1194px");
    expect(container.querySelector("[data-slot=tablet-frame-content]")).toBeInTheDocument();
  });
});
