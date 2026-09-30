import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useScrollDirection, useScrolled, useScrollSpy, scrollToId } from "@/lib/ballmac/scroll";

function setScrollY(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true });
  window.dispatchEvent(new Event("scroll"));
}
afterEach(() => setScrollY(0));

function Probe() {
  const scrolled = useScrolled(50);
  const direction = useScrollDirection(10);
  return <p data-testid="p">{`${scrolled}:${direction}`}</p>;
}

function Spy() {
  const active = useScrollSpy(["a", "b", "c"], { offset: 10 });
  return (
    <div>
      <p data-testid="active">{active}</p>
      <h2 id="a">A</h2>
      <h2 id="b">B</h2>
      <h2 id="c">C</h2>
    </div>
  );
}

describe("scroll utilities", () => {
  it("reports scrolled state and direction", async () => {
    render(<Probe />);
    expect(screen.getByTestId("p")).toHaveTextContent("false:up");
    act(() => setScrollY(200));
    await waitFor(() => expect(screen.getByTestId("p")).toHaveTextContent("true:down"));
    act(() => setScrollY(120));
    await waitFor(() => expect(screen.getByTestId("p")).toHaveTextContent("true:up"));
  });
  it("tracks the section whose top has passed the offset", async () => {
    const tops: Record<string, number> = { a: -300, b: 5, c: 400 };
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      return { top: tops[this.id] ?? 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON() {} } as DOMRect;
    });
    Object.defineProperty(document.documentElement, "scrollHeight", { value: 5000, configurable: true });
    render(<Spy />);
    act(() => setScrollY(10));
    await waitFor(() => expect(screen.getByTestId("active")).toHaveTextContent("b"));
    vi.restoreAllMocks();
  });
  it("scrolls to an element by id and reports missing ids", () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
    document.body.innerHTML = '<h2 id="x">X</h2>';
    expect(scrollToId("x", { offset: 20 })).toBe(true);
    expect(scrollTo).toHaveBeenCalled();
    expect(scrollToId("missing")).toBe(false);
  });
});
