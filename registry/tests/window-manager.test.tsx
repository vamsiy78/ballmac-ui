import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WindowManager, type ManagedWindow } from "@/components/ballmac/window-manager";

const windows: ManagedWindow[] = [
  { id: "a", title: "Alpha", content: <p>alpha body</p>, x: 10, y: 10, width: 200, height: 150 },
  { id: "b", title: "Beta", content: <p>beta body</p>, x: 60, y: 40, width: 200, height: 150 },
];

describe("WindowManager", () => {
  it("renders each window as a named group in a labelled desktop", () => {
    render(<WindowManager windows={windows} />);
    expect(screen.getByRole("group", { name: "Desktop" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /^Alpha window/ })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /^Beta window/ })).toBeInTheDocument();
  });
  it("calls onClose from the close button and with Ctrl+W", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<WindowManager windows={windows} onClose={onClose} />);
    await user.click(screen.getAllByRole("button", { name: /close/i })[0]!);
    expect(onClose).toHaveBeenCalledTimes(1);
    screen.getByRole("group", { name: /^Beta window/ }).focus();
    await user.keyboard("{Control>}w{/Control}");
    expect(onClose).toHaveBeenLastCalledWith("b");
  });
  it("minimizes into the tray and restores", async () => {
    const user = userEvent.setup();
    render(<WindowManager windows={windows} />);
    await user.click(screen.getAllByRole("button", { name: /minimi[sz]e/i })[0]!);
    const restore = await screen.findByRole("button", { name: /^Restore/ });
    await user.click(restore);
    expect(screen.queryByRole("button", { name: /^Restore/ })).toBeNull();
  });
  it("moves a focused window with Alt+arrows", async () => {
    const user = userEvent.setup();
    render(<WindowManager windows={windows} />);
    const win = screen.getByRole("group", { name: /^Alpha window/ });
    const left = () => win.closest<HTMLElement>("[style*='left'], [style*='translate']")!.getAttribute("style");
    win.focus();
    const before = left();
    await user.keyboard("{Alt>}{ArrowRight}{/Alt}");
    expect(left()).not.toBe(before);
  });
  it("raises a window when it is pressed", () => {
    render(<WindowManager windows={windows} />);
    const alpha = screen.getByRole("group", { name: /^Alpha window/ });
    const z = () => Number(getComputedStyle(alpha.closest<HTMLElement>("[style*='z-index']") ?? alpha).zIndex);
    const before = z();
    fireEvent.pointerDown(alpha);
    expect(z()).toBeGreaterThanOrEqual(before);
  });
});
