import { render, screen, waitFor } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => motion.reduce }));

import { AnimatedList, AnimatedListItem } from "@/components/ballmac/animated-list";

beforeEach(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterEach(() => {
  MotionGlobalConfig.skipAnimations = false;
  motion.reduce = false;
});

const list = (ids: number[], props = {}) => (
  <AnimatedList label="Feed" {...props}>
    {ids.map((id) => (
      <AnimatedListItem key={id}>Item {id}</AnimatedListItem>
    ))}
  </AnimatedList>
);

describe("AnimatedList", () => {
  it("is a named list of items", () => {
    render(list([1, 2]));
    expect(screen.getByRole("list", { name: "Feed" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
  it("shows a newly added item and drops removed ones", async () => {
    const { rerender } = render(list([1]));
    rerender(list([2, 1]));
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    rerender(list([2]));
    await waitFor(() => expect(screen.queryByText("Item 1")).toBeNull());
  });
  it("limits how many items are drawn", () => {
    render(list([1, 2, 3, 4], { max: 2 }));
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByText("Item 3")).toBeNull();
  });
  it("only announces additions when asked", () => {
    const { rerender } = render(list([1]));
    expect(screen.getByRole("list")).not.toHaveAttribute("aria-live");
    rerender(list([1], { announce: true }));
    expect(screen.getByRole("list")).toHaveAttribute("aria-live", "polite");
    expect(screen.getByRole("list")).toHaveAttribute("aria-relevant", "additions");
  });
  it("renders under reduced motion", () => {
    motion.reduce = true;
    render(list([1]));
    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });
});
