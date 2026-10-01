import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => motion.reduce }));

import { SmoothCursor } from "@/components/ballmac/smooth-cursor";

afterEach(() => {
  motion.reduce = false;
  MotionGlobalConfig.skipAnimations = false;
});

const cursor = (c: HTMLElement) => c.querySelector("[data-slot=smooth-cursor] > div[aria-hidden=true]");

describe("SmoothCursor", () => {
  it("renders its content untouched and shows no cursor until the pointer arrives", () => {
    const { container } = render(
      <SmoothCursor>
        <button type="button">Click</button>
      </SmoothCursor>
    );
    expect(screen.getByRole("button", { name: "Click" })).toBeInTheDocument();
    expect(cursor(container as HTMLElement)).toBeNull();
  });
  it("shows a decorative cursor while the mouse moves and hides it on leave", async () => {
    const { container } = render(<SmoothCursor>area</SmoothCursor>);
    const area = container.querySelector("[data-slot=smooth-cursor]")!;
    fireEvent.pointerMove(area, { clientX: 20, clientY: 20, pointerType: "mouse" });
    expect(cursor(container as HTMLElement)).not.toBeNull();
    MotionGlobalConfig.skipAnimations = true;
    fireEvent.pointerLeave(area);
    await waitFor(() => expect(cursor(container as HTMLElement)).toBeNull());
  });
  it("ignores touch pointers", () => {
    const { container } = render(<SmoothCursor>area</SmoothCursor>);
    fireEvent.pointerMove(container.querySelector("[data-slot=smooth-cursor]")!, { clientX: 5, clientY: 5, pointerType: "touch" });
    expect(cursor(container as HTMLElement)).toBeNull();
  });
  it("grows a label over elements that ask for one", () => {
    const { container } = render(
      <SmoothCursor>
        <div data-cursor-label="View project">Tile</div>
      </SmoothCursor>
    );
    fireEvent.pointerMove(screen.getByText("Tile"), { clientX: 10, clientY: 10, pointerType: "mouse" });
    expect(screen.getByText("View project")).toBeInTheDocument();
    expect(cursor(container as HTMLElement)).toContainElement(screen.getByText("View project"));
  });
  it("steps aside over text fields so the normal caret cursor is used", () => {
    const { container } = render(
      <SmoothCursor>
        <input aria-label="Email" />
      </SmoothCursor>
    );
    fireEvent.pointerMove(screen.getByLabelText("Email"), { clientX: 5, clientY: 5, pointerType: "mouse" });
    expect(cursor(container as HTMLElement)).toBeNull();
  });
  it("accepts your own cursor graphic", () => {
    const { container } = render(<SmoothCursor cursor={<span data-testid="mine" />}>area</SmoothCursor>);
    fireEvent.pointerMove(container.querySelector("[data-slot=smooth-cursor]")!, { clientX: 5, clientY: 5, pointerType: "mouse" });
    expect(screen.getByTestId("mine")).toBeInTheDocument();
  });
});
