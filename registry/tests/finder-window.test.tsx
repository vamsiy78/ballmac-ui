import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FinderWindow, type FinderNode } from "@/components/ballmac/finder-window";

const root: FinderNode = {
  id: "home",
  name: "Home",
  kind: "folder",
  children: [
    { id: "docs", name: "Documents", kind: "folder", children: [{ id: "a", name: "a.pdf", kind: "file", ext: "pdf" }, { id: "b", name: "b.txt", kind: "file", ext: "txt" }] },
    { id: "pics", name: "Pictures", kind: "folder", children: [] },
    { id: "c", name: "c.md", kind: "file", ext: "md" },
  ],
};

describe("FinderWindow", () => {
  it("lists the folder as a listbox and opens folders on double-click, with back and forward", async () => {
    const user = userEvent.setup();
    render(<FinderWindow root={root} />);
    const list = screen.getByRole("listbox");
    expect(within(list).getAllByRole("option")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    await user.dblClick(screen.getByRole("option", { name: "Documents, folder" }));
    expect(screen.getByRole("option", { name: "a.pdf, pdf" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("option", { name: "Documents, folder" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Forward" }));
    expect(screen.getByRole("option", { name: "b.txt, txt" })).toBeInTheDocument();
  });
  it("selects with click and Cmd/Ctrl+A, and reports the selection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<FinderWindow root={root} onSelectionChange={onSelectionChange} />);
    await user.click(screen.getByRole("option", { name: "c.md, md" }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(["c"]);
    await user.keyboard("{Control>}a{/Control}");
    expect(onSelectionChange).toHaveBeenLastCalledWith(["docs", "pics", "c"]);
    await user.keyboard("{Escape}");
    expect(onSelectionChange).toHaveBeenLastCalledWith([]);
  });
  it("opens files with Return and goes up with Cmd+Up", async () => {
    const user = userEvent.setup();
    const onOpenFile = vi.fn();
    render(<FinderWindow root={root} defaultFolder="docs" onOpenFile={onOpenFile} />);
    screen.getByRole("listbox").focus();
    await user.keyboard("{Enter}");
    expect(onOpenFile).toHaveBeenCalledWith(expect.objectContaining({ id: "a" }));
    await user.keyboard("{Control>}{ArrowUp}{/Control}");
    expect(screen.getByRole("option", { name: "Documents, folder" })).toBeInTheDocument();
  });
  it("filters with search and switches views", async () => {
    const user = userEvent.setup();
    render(<FinderWindow root={root} />);
    await user.type(screen.getByRole("searchbox", { name: "Search this folder" }), "pic");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: /List/ }));
    expect(screen.getByRole("button", { name: /List/ })).toHaveAttribute("aria-pressed", "true");
  });
});
