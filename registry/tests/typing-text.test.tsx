import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => motion.reduce }));

import { TypingText } from "@/components/ballmac/typing-text";

const visible = (c: HTMLElement) => c.querySelector("[aria-hidden=true]")!.textContent;

describe("TypingText", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    motion.reduce = false;
  });

  it("types one string once and calls onComplete", () => {
    const onComplete = vi.fn();
    const { container } = render(<TypingText text="Hi there" typingSpeed={50} onComplete={onComplete} />);
    expect(container.querySelector(".sr-only")).toHaveTextContent("Hi there");
    expect(visible(container)).toBe("");
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(visible(container)!.length).toBeGreaterThan(0);
    expect(visible(container)!.length).toBeLessThan(8);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(visible(container)).toBe("Hi there");
    expect(onComplete).toHaveBeenCalledOnce();
  });
  it("erases and moves on to the next string", () => {
    const { container } = render(<TypingText text={["ab", "cd"]} typingSpeed={10} deleteSpeed={10} pause={100} />);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(visible(container)).toBe("ab");
    act(() => {
      vi.advanceTimersByTime(130);
    });
    expect(visible(container)).toBe("cd");
  });
  it("shows the text whole, with no caret, under reduced motion", () => {
    motion.reduce = true;
    const { container } = render(<TypingText text="Whole text" />);
    expect(visible(container)).toBe("Whole text");
    expect(container.querySelector("[aria-hidden=true] span")).toBeNull();
  });
});
