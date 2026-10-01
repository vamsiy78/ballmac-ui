import { act, render, renderHook, screen } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { Hud, useTransientHud } from "@/components/ballmac/hud";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterEach(() => vi.useRealTimers());

describe("Hud", () => {
  it("announces the level politely and draws a segmented bar", () => {
    const { container } = render(<Hud value={50} visible />);
    expect(screen.getByRole("status")).toHaveTextContent("Volume 50 percent");
    expect(container.querySelector("[data-slot=hud]")).toHaveAttribute("aria-hidden", "true");
    const segments = container.querySelectorAll("[data-slot=hud] span.flex.w-full > span");
    expect(segments).toHaveLength(16);
    expect([...segments].filter((s) => s.classList.contains("bg-white")).length).toBe(8);
  });
  it("speaks muted state and names the kind", () => {
    const { rerender } = render(<Hud value={50} muted visible />);
    expect(screen.getByRole("status")).toHaveTextContent("Volume muted");
    rerender(<Hud kind="brightness" value={30} visible />);
    expect(screen.getByRole("status")).toHaveTextContent("Brightness 30 percent");
  });
  it("is silent and empty when hidden", () => {
    const { container } = render(<Hud value={50} visible={false} />);
    expect(container.querySelector("[data-slot=hud]")).toBeNull();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });
  it("asks to hide after the duration and restarts when the value changes", () => {
    vi.useFakeTimers();
    const onVisibleChange = vi.fn();
    const { rerender } = render(<Hud value={40} visible duration={1000} onVisibleChange={onVisibleChange} />);
    act(() => void vi.advanceTimersByTime(800));
    rerender(<Hud value={50} visible duration={1000} onVisibleChange={onVisibleChange} />);
    act(() => void vi.advanceTimersByTime(800));
    expect(onVisibleChange).not.toHaveBeenCalled();
    act(() => void vi.advanceTimersByTime(300));
    expect(onVisibleChange).toHaveBeenCalledWith(false);
  });
  it("renders the pill variant with a percentage", () => {
    const { container } = render(<Hud variant="pill" value={36} visible />);
    expect(container.querySelector("[data-slot=hud]")).toHaveTextContent("36%");
  });
});

describe("useTransientHud", () => {
  it("shows and hides", () => {
    const { result } = renderHook(() => useTransientHud());
    expect(result.current.visible).toBe(false);
    act(() => result.current.show());
    expect(result.current.visible).toBe(true);
    act(() => result.current.hide());
    expect(result.current.visible).toBe(false);
  });
});
