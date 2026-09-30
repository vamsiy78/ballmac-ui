import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ballmac/command";

describe("Command", () => {
  it("filters, shows the empty state, and selects with the keyboard", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Command label="Commands">
        <CommandInput />
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
          <CommandItem onSelect={onSelect}>Calendar</CommandItem>
          <CommandItem>Settings</CommandItem>
        </CommandList>
      </Command>,
    );
    await user.type(screen.getByRole("combobox", { name: "Commands" }), "sett");
    expect(screen.queryByRole("option", { name: "Calendar" })).not.toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(onSelect).not.toHaveBeenCalled();
    await user.clear(screen.getByRole("combobox", { name: "Commands" }));
    await user.keyboard("cal{Enter}");
    expect(onSelect).toHaveBeenCalledOnce();
    await user.clear(screen.getByRole("combobox", { name: "Commands" }));
    await user.type(screen.getByRole("combobox", { name: "Commands" }), "zzz");
    expect(await screen.findByText("No results")).toBeInTheDocument();
  });
  it("toggles the dialog with Cmd/Ctrl+K and closes with Escape", async () => {
    const user = userEvent.setup();
    render(
      <CommandDialog title="Palette">
        <CommandInput aria-label="Search" />
        <CommandList>
          <CommandItem>Open</CommandItem>
        </CommandList>
      </CommandDialog>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.keyboard("{Control>}k{/Control}");
    expect(await screen.findByRole("dialog", { name: "Palette" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
