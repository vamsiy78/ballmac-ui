import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { KeyboardShortcuts, KeyboardShortcutsDialog } from "@/components/ballmac/keyboard-shortcuts";

const groups = [
  { title: "General", shortcuts: [{ label: "Open command menu", keys: ["Mod", "K"] }, { label: "Save", keys: ["Mod", "S"] }] },
  { title: "Navigation", shortcuts: [{ label: "Go to inbox", keys: ["G", "I"], sequence: true }] },
];

describe("KeyboardShortcuts", () => {
  it("draws platform keys and speaks them", () => {
    const { rerender } = render(<KeyboardShortcuts groups={groups} platform="mac" />);
    expect(screen.getByText("Command plus K")).toBeInTheDocument();
    expect(screen.getByText("G then I")).toBeInTheDocument();
    rerender(<KeyboardShortcuts groups={groups} platform="other" />);
    expect(screen.getByText("Ctrl plus K")).toBeInTheDocument();
  });
  it("filters by action or key and announces the count", async () => {
    const user = userEvent.setup();
    render(<KeyboardShortcuts groups={groups} platform="other" />);
    await user.type(screen.getByRole("searchbox", { name: "Search shortcuts" }), "save");
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.queryByText("Open command menu")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("1 shortcut found");
    await user.clear(screen.getByRole("searchbox"));
    await user.type(screen.getByRole("searchbox"), "zzz");
    expect(screen.getByText(/No shortcut matches/)).toBeInTheDocument();
  });
  it("opens the dialog with ? outside text fields and closes with Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <>
        <input aria-label="Note" />
        <KeyboardShortcutsDialog groups={groups} platform="other" onOpenChange={onOpenChange} />
      </>
    );
    await user.click(screen.getByRole("textbox", { name: "Note" }));
    await user.keyboard("?");
    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(document.body);
    await user.keyboard("?");
    expect(await screen.findByRole("dialog", { name: "Keyboard shortcuts" })).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledWith(true);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
