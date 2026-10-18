import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  MenuBar,
  MenuBarCheckboxItem,
  MenuBarContent,
  MenuBarItem,
  MenuBarMenu,
  MenuBarShortcut,
  MenuBarStatus,
  MenuBarStatusItem,
  MenuBarTrigger,
} from "@/components/ballmac/menu-bar";

function Bar({ onNew = vi.fn(), onCheck = vi.fn() }) {
  return (
    <MenuBar>
      <MenuBarMenu>
        <MenuBarTrigger>File</MenuBarTrigger>
        <MenuBarContent>
          <MenuBarItem onSelect={onNew}>
            New <MenuBarShortcut>⌘N</MenuBarShortcut>
          </MenuBarItem>
          <MenuBarCheckboxItem checked onCheckedChange={onCheck}>
            Show ruler
          </MenuBarCheckboxItem>
        </MenuBarContent>
      </MenuBarMenu>
      <MenuBarMenu>
        <MenuBarTrigger>Edit</MenuBarTrigger>
        <MenuBarContent>
          <MenuBarItem>Undo</MenuBarItem>
        </MenuBarContent>
      </MenuBarMenu>
      <MenuBarStatus>
        <MenuBarStatusItem aria-label="Wi-Fi" />
      </MenuBarStatus>
    </MenuBar>
  );
}

describe("MenuBar", () => {
  it("opens a menu and runs an item", async () => {
    const onNew = vi.fn();
    render(<Bar onNew={onNew} />);
    await userEvent.click(screen.getByText("File"));
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitemcheckbox", { name: "Show ruler" })).toHaveAttribute("aria-checked", "true");
    await userEvent.click(screen.getByRole("menuitem", { name: /New/ }));
    expect(onNew).toHaveBeenCalledTimes(1);
  });

  it("keeps the status area outside the menubar", () => {
    render(<Bar />);
    const bar = screen.getByRole("menubar");
    expect(bar).toContainElement(screen.getByText("File"));
    expect(bar).not.toContainElement(screen.getByLabelText("Wi-Fi"));
  });

  it("moves between menus with the arrow keys", async () => {
    render(<Bar />);
    screen.getByText("File").focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByText("Edit")).toHaveFocus();
  });
});
