import { render, screen, waitFor } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => motion.reduce }));

import { StaggerItem, StaggerList } from "@/components/ballmac/stagger-list";

beforeEach(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterEach(() => {
  MotionGlobalConfig.skipAnimations = false;
  motion.reduce = false;
});

const list = (ids: number[], props = {}) => (
  <StaggerList inView={false} aria-label="Results" {...props}>
    {ids.map((id) => (
      <StaggerItem key={id}>Result {id}</StaggerItem>
    ))}
  </StaggerList>
);

describe("StaggerList", () => {
  it("renders real list markup", () => {
    render(list([1, 2, 3]));
    expect(screen.getByRole("list", { name: "Results" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
  it("can be an ordered list", () => {
    const { container } = render(list([1], { as: "ol" }));
    expect(container.querySelector("ol")).not.toBeNull();
  });
  it("removes items that are filtered out and keeps the rest", async () => {
    const { rerender } = render(list([1, 2, 3]));
    rerender(list([2]));
    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(1));
    expect(screen.getByText("Result 2")).toBeInTheDocument();
  });
  it("shows items immediately under reduced motion", () => {
    motion.reduce = true;
    render(list([1, 2]));
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
