import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  MacContextMenu,
  MacContextMenuCheckboxItem,
  MacContextMenuContent,
  MacContextMenuItem,
  MacContextMenuRadioGroup,
  MacContextMenuRadioItem,
  MacContextMenuShortcut,
  MacContextMenuTrigger,
} from "@/components/ballmac/mac-context-menu";

function Menu({ onOpen = vi.fn(), onCheck = vi.fn(), onSort = vi.fn() }) {
  return (
    <MacContextMenu>
      <MacContextMenuTrigger>Target</MacContextMenuTrigger>
      <MacContextMenuContent>
        <MacContextMenuItem onSelect={onOpen}>Open <MacContextMenuShortcut>⌘O</MacContextMenuShortcut></MacContextMenuItem>
        <MacContextMenuItem destructive>Move to Bin</MacContextMenuItem>
        <MacContextMenuCheckboxItem checked onCheckedChange={onCheck}>Preview</MacContextMenuCheckboxItem>
        <MacContextMenuRadioGroup value="name" onValueChange={onSort}>
          <MacContextMenuRadioItem value="name">Name</MacContextMenuRadioItem>
          <MacContextMenuRadioItem value="date">Date</MacContextMenuRadioItem>
        </MacContextMenuRadioGroup>
      </MacContextMenuContent>
    </MacContextMenu>
  );
}

describe("MacContextMenu", () => {
  it("opens on right-click and exposes menu roles", async () => {
    render(<Menu />);
    fireEvent.contextMenu(screen.getByText("Target"));
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Open/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitemcheckbox", { name: "Preview" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitemradio", { name: "Name" })).toHaveAttribute("aria-checked", "true");
  });
  it("runs the selected action and closes", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<Menu onOpen={onOpen} />);
    fireEvent.contextMenu(screen.getByText("Target"));
    await user.click(await screen.findByRole("menuitem", { name: /Open/ }));
    expect(onOpen).toHaveBeenCalled();
    expect(screen.queryByRole("menu")).toBeNull();
  });
  it("reports radio changes", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(<Menu onSort={onSort} />);
    fireEvent.contextMenu(screen.getByText("Target"));
    await user.click(await screen.findByRole("menuitemradio", { name: "Date" }));
    expect(onSort).toHaveBeenCalledWith("date");
  });
  it("marks destructive items", async () => {
    render(<Menu />);
    fireEvent.contextMenu(screen.getByText("Target"));
    expect(await screen.findByRole("menuitem", { name: "Move to Bin" })).toHaveAttribute("data-destructive");
  });
});
