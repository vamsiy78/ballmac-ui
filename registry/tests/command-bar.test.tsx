import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CommandBar } from "@/components/ballmac/command-bar";

function setup(onSelect = vi.fn(), onTheme = vi.fn()) {
  render(
    <CommandBar
      groups={[
        {
          heading: "Actions",
          items: [
            { id: "invite", label: "Invite teammate", onSelect },
            { id: "theme", label: "Change theme…", pages: [{ heading: "Theme", items: [{ id: "dark", label: "Dark", onSelect: onTheme }] }] },
          ],
        },
      ]}
    />,
  );
}

describe("CommandBar", () => {
  it("opens from the trigger, filters, runs a command and closes", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    setup(onSelect);
    await user.click(screen.getByRole("button", { name: /Search or jump to/ }));
    expect(await screen.findByRole("dialog", { name: "Command bar" })).toBeInTheDocument();
    await user.keyboard("inv");
    expect(screen.queryByText("Change theme…")).not.toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
  it("drills into a page, shows the breadcrumb and goes back with Backspace", async () => {
    const user = userEvent.setup();
    const onTheme = vi.fn();
    setup(vi.fn(), onTheme);
    await user.click(screen.getByRole("button", { name: /Search or jump to/ }));
    await user.click(await screen.findByText("Change theme…"));
    expect(await screen.findByText("Dark")).toBeInTheDocument();
    expect(screen.getByText("Change theme…", { selector: "[aria-current=page]" })).toBeInTheDocument();
    expect(screen.queryByText("Invite teammate")).not.toBeInTheDocument();
    // Focus returns to the field on the next frame; Backspace goes to whatever has focus, so wait for it.
    await waitFor(() => expect(screen.getByRole("combobox")).toHaveFocus());
    await user.keyboard("{Backspace}");
    expect(await screen.findByText("Invite teammate")).toBeInTheDocument();
    expect(onTheme).not.toHaveBeenCalled();
  });
  it("toggles with Ctrl+K and hides the trigger when asked", async () => {
    const user = userEvent.setup();
    render(<CommandBar groups={[{ heading: "Go", items: [{ id: "a", label: "Home" }] }]} trigger={false} />);
    expect(screen.queryByRole("button", { name: /Search/ })).not.toBeInTheDocument();
    await user.keyboard("{Control>}k{/Control}");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
});
