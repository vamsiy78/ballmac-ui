import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HyperText } from "@/components/ballmac/hyper-text";

const shown = (c: HTMLElement) => c.querySelector("[aria-hidden=true]")!.textContent;

describe("HyperText", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    MotionGlobalConfig.skipAnimations = true;
  });
  afterEach(() => {
    vi.useRealTimers();
    MotionGlobalConfig.skipAnimations = false;
  });

  it("reads the real text once and settles on it, uppercased", () => {
    const onComplete = vi.fn();
    const { container } = render(<HyperText speed={20} onComplete={onComplete}>Gate b14</HyperText>);
    expect(container.querySelector(".sr-only")).toHaveTextContent("Gate b14");
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(shown(container)).toBe("GATE B14");
    expect(onComplete).toHaveBeenCalled();
  });
  it("is focusable and replays when trigger is hover", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const { container } = render(<HyperText trigger="hover" speed={10}>Hi</HyperText>);
    const root = container.querySelector("[data-slot=hyper-text]") as HTMLElement;
    expect(root).toHaveAttribute("tabindex", "0");
    await user.tab();
    expect(root).toHaveFocus();
  });
  it("draws tiles on request", () => {
    const { container } = render(<HyperText variant="tiles">Ab</HyperText>);
    expect(container.querySelectorAll(".bg-foreground")).toHaveLength(2);
  });
});
