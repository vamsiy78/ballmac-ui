import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => motion.reduce }));

import { IconCloud } from "@/components/ballmac/icon-cloud";

afterEach(() => {
  motion.reduce = false;
});

describe("IconCloud", () => {
  it("is a named list with one item per child, in order", () => {
    render(
      <IconCloud label="Tech">
        <span>React</span>
        <span>Node</span>
        <span>Go</span>
      </IconCloud>
    );
    expect(screen.getByRole("list", { name: "Tech" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(["React", "Node", "Go"]);
  });
  it("places items on a sphere right away, using depth for size and opacity", () => {
    render(
      <IconCloud size={200}>
        {["a", "b", "c", "d", "e", "f"].map((x) => (
          <span key={x}>{x}</span>
        ))}
      </IconCloud>
    );
    const items = screen.getAllByRole("listitem");
    for (const li of items) {
      expect(li.style.transform).toContain("translate3d(");
      expect(Number(li.style.opacity)).toBeGreaterThanOrEqual(0.6);
    }
    expect(new Set(items.map((li) => li.style.transform)).size).toBe(items.length);
  });
  it("keeps links clickable: a click with no drag still reaches the link", () => {
    const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault());
    render(
      <IconCloud>
        <a href="#a" onClick={onClick}>
          Alpha
        </a>
        <a href="#b">Beta</a>
      </IconCloud>
    );
    const link = screen.getByRole("link", { name: "Alpha" });
    fireEvent.pointerDown(link, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(link, { clientX: 12, clientY: 11 });
    fireEvent.pointerUp(link);
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledOnce();
  });
  it("keeps every item reachable by keyboard", () => {
    render(
      <IconCloud>
        <a href="#a">One</a>
        <a href="#b">Two</a>
      </IconCloud>
    );
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });
  it("draws a still sphere under reduced motion", () => {
    motion.reduce = true;
    render(
      <IconCloud>
        <span>x</span>
        <span>y</span>
      </IconCloud>
    );
    expect(screen.getAllByRole("listitem")[0]!.style.transform).toContain("translate3d(");
  });
});
