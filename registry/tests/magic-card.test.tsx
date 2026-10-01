import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => motion.reduce }));

import { MagicCard } from "@/components/ballmac/magic-card";

afterEach(() => {
  motion.reduce = false;
});

describe("MagicCard", () => {
  it("renders its content", () => {
    render(<MagicCard>Hello</MagicCard>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
  it("writes the pointer position to CSS variables, and resets on leave", () => {
    const { container } = render(<MagicCard>Move</MagicCard>);
    const card = container.querySelector("[data-slot=magic-card]") as HTMLElement;
    fireEvent.pointerMove(card, { clientX: 40, clientY: 25 });
    expect(card.style.getPropertyValue("--m-on")).toBe("1");
    expect(card.style.getPropertyValue("--mx")).toMatch(/px$/);
    fireEvent.pointerLeave(card);
    expect(card.style.getPropertyValue("--m-on")).toBe("0");
  });
  it("lights the card when something inside has keyboard focus", () => {
    const { container } = render(
      <MagicCard>
        <button type="button">Inside</button>
      </MagicCard>
    );
    const card = container.querySelector("[data-slot=magic-card]") as HTMLElement;
    fireEvent.focus(screen.getByRole("button"));
    expect(card.style.getPropertyValue("--m-on")).toBe("1");
    fireEvent.blur(screen.getByRole("button"));
    expect(card.style.getPropertyValue("--m-on")).toBe("0");
  });
  it("does not track the pointer under reduced motion", () => {
    motion.reduce = true;
    const { container } = render(<MagicCard>Still</MagicCard>);
    const card = container.querySelector("[data-slot=magic-card]") as HTMLElement;
    fireEvent.pointerMove(card, { clientX: 10, clientY: 10 });
    expect(card.style.getPropertyValue("--m-on")).toBe("");
  });
  it("takes its colors from theme tokens", () => {
    const { container } = render(<MagicCard from="chart-2" to="chart-5">x</MagicCard>);
    const card = container.querySelector("[data-slot=magic-card]") as HTMLElement;
    expect(card.style.getPropertyValue("--from")).toBe("var(--chart-2)");
    expect(card.style.getPropertyValue("--to")).toBe("var(--chart-5)");
  });
});
