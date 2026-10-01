import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Launchpad, type LaunchpadApp } from "@/components/ballmac/launchpad";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, value: 900 });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, value: 600 });
  globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;
});

const apps: LaunchpadApp[] = ["Mail", "Maps", "Music", "Notes"].map((name) => ({ id: name.toLowerCase(), name, icon: <span>{name[0]}</span> }));

describe("Launchpad", () => {
  it("renders nothing when closed and a named dialog when open", () => {
    const { rerender } = render(<Launchpad apps={apps} open={false} />);
    expect(screen.queryByRole("dialog")).toBeNull();
    rerender(<Launchpad apps={apps} open />);
    expect(screen.getByRole("dialog", { name: "Launchpad" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mail" })).toBeInTheDocument();
  });
  it("focuses search, filters as you type and launches the first match with Return", async () => {
    const user = userEvent.setup();
    const onLaunch = vi.fn();
    render(<Launchpad apps={apps} open onLaunch={onLaunch} />);
    const search = screen.getByRole("searchbox", { name: "Search apps" });
    await vi.waitFor(() => expect(search).toHaveFocus());
    await user.type(search, "ma");
    expect(screen.queryByRole("button", { name: "Music" })).toBeNull();
    await user.keyboard("{Enter}");
    expect(onLaunch).toHaveBeenCalledWith(expect.objectContaining({ id: "mail" }));
  });
  it("launches on click and closes with Escape", async () => {
    const user = userEvent.setup();
    const onLaunch = vi.fn();
    const onClose = vi.fn();
    render(<Launchpad apps={apps} open onLaunch={onLaunch} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "Notes" }));
    expect(onLaunch).toHaveBeenCalledWith(expect.objectContaining({ id: "notes" }));
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
  it("shows a message when nothing matches", async () => {
    const user = userEvent.setup();
    render(<Launchpad apps={apps} open />);
    await user.type(screen.getByRole("searchbox"), "zzz");
    expect(screen.getByText(/No apps/i)).toBeInTheDocument();
  });
});
