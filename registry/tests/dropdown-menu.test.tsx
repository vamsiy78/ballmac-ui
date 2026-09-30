import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ballmac/dropdown-menu";

function setup(onSelect = vi.fn()) {
  render(
    <DropdownMenu>
      <DropdownMenuTrigger>Account</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={onSelect}>Profile</DropdownMenuItem>
        <DropdownMenuItem destructive>Sign out</DropdownMenuItem>
        <DropdownMenuCheckboxItem checked>Notifications</DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup value="a">
          <DropdownMenuRadioItem value="a">Alpha</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="b">Beta</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
}

describe("DropdownMenu", () => {
  it("opens with the keyboard, focuses the first item and selects with Enter", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    setup(onSelect);
    screen.getByRole("button", { name: "Account" }).focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  });
  it("exposes checkbox and radio state and closes on Escape with focus restored", async () => {
    const user = userEvent.setup();
    setup();
    const trigger = screen.getByRole("button", { name: "Account" });
    await user.click(trigger);
    expect(await screen.findByRole("menuitemcheckbox", { name: "Notifications" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitemradio", { name: "Alpha" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitemradio", { name: "Beta" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("menuitem", { name: "Sign out" })).toHaveAttribute("data-variant", "destructive");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
});
