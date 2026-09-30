import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StickyScroll } from "@/components/ballmac/sticky-scroll";

const items = [
  { id: "one", title: "First", description: "First text", visual: <div>Visual one</div> },
  { id: "two", title: "Second", description: "Second text", visual: <div>Visual two</div> },
];

describe("StickyScroll", () => {
  it("renders steps as an ordered list with exactly one current step", () => {
    const onActiveChange = vi.fn();
    render(<StickyScroll items={items} onActiveChange={onActiveChange} />);
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["First", "Second"]);
    expect(document.querySelectorAll("[aria-current=step]")).toHaveLength(1);
    expect(onActiveChange).toHaveBeenCalled();
  });
  it("shows each step's visual inline for small screens and pins the active one", () => {
    const { container } = render(<StickyScroll items={items} visualSide="left" />);
    expect(screen.getAllByText("Visual one").length).toBeGreaterThanOrEqual(1);
    expect(container.querySelectorAll("[aria-hidden=true]").length).toBeGreaterThan(0);
  });
});
