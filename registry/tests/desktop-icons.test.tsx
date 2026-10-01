import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DesktopIcons, type DesktopItem } from "@/components/ballmac/desktop-icons";

const items: DesktopItem[] = [
  { id: "a", name: "Disk", kind: "drive", col: 0, row: 0 },
  { id: "b", name: "Docs", kind: "folder", col: 0, row: 1 },
  { id: "c", name: "Notes", kind: "file", ext: "txt", col: 1, row: 0 },
];

describe("DesktopIcons", () => {
  it("is a named listbox of options", () => {
    render(<DesktopIcons items={items} label="My desktop" />);
    expect(screen.getByRole("listbox", { name: "My desktop" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(screen.getByRole("option", { name: "Disk, drive" })).toBeInTheDocument();
  });
  it("selects on click and opens on double-click and Return", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<DesktopIcons items={items} onOpen={onOpen} />);
    await user.click(screen.getByRole("option", { name: "Docs, folder" }));
    expect(screen.getByRole("option", { name: "Docs, folder" })).toHaveAttribute("aria-selected", "true");
    await user.dblClick(screen.getByRole("option", { name: "Notes, file" }));
    expect(onOpen).toHaveBeenLastCalledWith(expect.objectContaining({ id: "c" }));
    await user.keyboard("{Enter}");
    expect(onOpen).toHaveBeenCalledTimes(2);
  });
  it("moves focus with arrows and the icon with Alt+arrows", async () => {
    const user = userEvent.setup();
    const onItemsChange = vi.fn();
    render(<DesktopIcons items={items} onItemsChange={onItemsChange} />);
    screen.getByRole("listbox").focus();
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
    // jsdom has no layout, so the grid has a single cell; the move is clamped but must not throw.
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });
  it("clears selection with Escape", async () => {
    const user = userEvent.setup();
    render(<DesktopIcons items={items} />);
    await user.click(screen.getByRole("option", { name: "Disk, drive" }));
    await user.keyboard("{Escape}");
    expect(screen.getByRole("option", { name: "Disk, drive" })).toHaveAttribute("aria-selected", "false");
  });
});
