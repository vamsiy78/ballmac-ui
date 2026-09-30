import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ballmac/menubar";

function setup(onSelect = vi.fn()) {
  render(
    <Menubar aria-label="Editor">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onSelect={onSelect}>New</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>,
  );
}

describe("Menubar", () => {
  it("has the menubar role and moves between triggers with arrow keys", async () => {
    const user = userEvent.setup();
    setup();
    expect(screen.getByRole("menubar", { name: "Editor" })).toBeInTheDocument();
    screen.getByRole("menuitem", { name: "File" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus();
  });
  it("opens a menu with ArrowDown, switches menus with ArrowRight and selects an item", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    setup(onSelect);
    screen.getByRole("menuitem", { name: "File" }).focus();
    await user.keyboard("{ArrowDown}");
    expect(await screen.findByRole("menuitem", { name: "New" })).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("menuitem", { name: "New" })).not.toBeInTheDocument());
  });
});
