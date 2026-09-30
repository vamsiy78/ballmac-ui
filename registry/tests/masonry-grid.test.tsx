import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MasonryGrid, MasonryItem } from "@/components/ballmac/masonry-grid";

describe("MasonryGrid", () => {
  it("applies a fixed or per-breakpoint column count and keeps DOM order", () => {
    const { container, rerender } = render(
      <MasonryGrid columns={3} gap="lg">
        <MasonryItem>One</MasonryItem>
        <MasonryItem>Two</MasonryItem>
      </MasonryGrid>,
    );
    const grid = container.querySelector("[data-slot=masonry-grid]")!;
    expect(grid).toHaveClass("columns-3", "gap-6");
    expect(Array.from(grid.children).map((c) => c.textContent)).toEqual(["One", "Two"]);
    rerender(
      <MasonryGrid columns={{ base: 1, sm: 2, xl: 4 }}>
        <MasonryItem>One</MasonryItem>
      </MasonryGrid>,
    );
    expect(container.querySelector("[data-slot=masonry-grid]")).toHaveClass("columns-1", "sm:columns-2", "xl:columns-4");
  });
  it("keeps tiles whole and renders revealed items", () => {
    render(
      <MasonryGrid reveal>
        <MasonryItem>Tile</MasonryItem>
      </MasonryGrid>,
    );
    expect(screen.getByText("Tile")).toHaveClass("break-inside-avoid");
  });
});
