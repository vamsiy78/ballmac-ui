import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => motion.reduce }));

import { InView } from "@/components/ballmac/in-view";

afterEach(() => {
  motion.reduce = false;
});

describe("InView", () => {
  it("marks itself when it is on screen", () => {
    render(<InView effect="none">Hello</InView>);
    expect(screen.getByText("Hello")).toHaveAttribute("data-in-view", "true");
  });
  it("passes the state to a function child", () => {
    render(<InView effect="none">{(inView) => (inView ? "visible" : "hidden")}</InView>);
    expect(screen.getByText("visible")).toBeInTheDocument();
  });
  it("calls onInViewChange when it enters the view", () => {
    const onInViewChange = vi.fn();
    render(<InView effect="none" onInViewChange={onInViewChange}>x</InView>);
    expect(onInViewChange).toHaveBeenCalledWith(true);
  });
  it("renders the chosen element and keeps content under reduced motion", () => {
    motion.reduce = true;
    render(
      <ul>
        <InView as="li" effect="slide-up">
          Item
        </InView>
      </ul>
    );
    expect(screen.getByRole("listitem")).toHaveTextContent("Item");
  });
});
