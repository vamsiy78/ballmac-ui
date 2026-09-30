import { act, render, screen } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThinkingIndicator, formatElapsed } from "@/components/ballmac/thinking-indicator";

describe("ThinkingIndicator", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    MotionGlobalConfig.skipAnimations = false;
  });

  it("announces one status label and keeps the cycling text out of the accessibility tree", () => {
    render(<ThinkingIndicator label={["Reading", "Writing"]} statusLabel="Assistant is working" />);
    expect(screen.getByRole("status")).toHaveTextContent("Assistant is working");
    expect(screen.getByText("Reading")).toHaveAttribute("class");
    expect(screen.getByText("Reading").closest("[aria-hidden=true]")).not.toBeNull();
  });
  it("moves through labels on the interval", async () => {
    vi.useRealTimers();
    MotionGlobalConfig.skipAnimations = true;
    render(<ThinkingIndicator label={["Reading", "Writing"]} interval={120} />);
    expect(screen.getByText("Reading")).toBeInTheDocument();
    expect(await screen.findByText("Writing", {}, { timeout: 2000 })).toBeInTheDocument();
  });
  it("counts seconds when the timer is on, or follows elapsed", () => {
    const { rerender } = render(<ThinkingIndicator showTimer />);
    act(() => { vi.advanceTimersByTime(3000); });
    expect(screen.getByText("3s")).toBeInTheDocument();
    rerender(<ThinkingIndicator showTimer elapsed={65} />);
    expect(screen.getByText("1:05")).toBeInTheDocument();
  });
  it("formats elapsed time", () => {
    expect(formatElapsed(9)).toBe("9s");
    expect(formatElapsed(125)).toBe("2:05");
  });
});
