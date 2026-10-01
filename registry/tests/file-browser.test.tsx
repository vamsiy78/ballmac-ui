import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FileBrowser, formatSize, type FileEntry } from "@/components/ballmac/file-browser";

const entries: FileEntry[] = [
  { id: "d", name: "Design", kind: "folder", modified: "2026-09-01T00:00:00Z", children: [{ id: "t", name: "tokens.json", kind: "file", size: 800 }] },
  { id: "r", name: "readme.md", kind: "file", size: 5000, modified: "2026-09-10T00:00:00Z" },
  { id: "v", name: "demo.mp4", kind: "file", size: 150_000_000, modified: "2026-09-05T00:00:00Z" },
];

describe("formatSize", () => {
  it("formats bytes", () => {
    expect(formatSize(512)).toBe("512 B");
    expect(formatSize(2048)).toBe("2 KB");
    expect(formatSize(1_500_000)).toBe("1.4 MB");
    expect(formatSize(undefined)).toBe("—");
  });
});

describe("FileBrowser", () => {
  it("lists files with sortable columns and aria-sort", async () => {
    const user = userEvent.setup();
    render(<FileBrowser entries={entries} />);
    const nameHeader = screen.getByRole("columnheader", { name: /Name/ });
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    await user.click(within(nameHeader).getByRole("button"));
    expect(nameHeader).toHaveAttribute("aria-sort", "descending");
  });
  it("navigates into folders with breadcrumbs", async () => {
    const user = userEvent.setup();
    render(<FileBrowser entries={entries} rootLabel="Project" />);
    await user.dblClick(screen.getByText("Design"));
    expect(screen.getByText("tokens.json")).toBeInTheDocument();
    await user.click(within(screen.getByRole("navigation", { name: "Folder path" })).getByRole("button", { name: "Project" }));
    expect(screen.getByText("readme.md")).toBeInTheDocument();
  });
  it("selects rows, shows the bulk bar, and runs delete and download", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const onDownload = vi.fn();
    render(<FileBrowser entries={entries} onDelete={onDelete} onDownload={onDownload} />);
    await user.click(screen.getByRole("checkbox", { name: "Select readme.md" }));
    const bar = screen.getByRole("region", { name: "Selection actions" });
    expect(bar).toHaveTextContent("1 selected");
    await user.click(within(bar).getByRole("button", { name: /Download/ }));
    expect(onDownload).toHaveBeenCalledWith(["r"]);
    await user.click(within(bar).getByRole("button", { name: /Delete/ }));
    expect(onDelete).toHaveBeenCalledWith(["r"]);
  });
  it("select all marks everything and is indeterminate for part", async () => {
    const user = userEvent.setup();
    render(<FileBrowser entries={entries} />);
    const all = screen.getByRole("checkbox", { name: "Select all files" }) as HTMLInputElement;
    await user.click(screen.getByRole("checkbox", { name: "Select readme.md" }));
    expect(all.indeterminate).toBe(true);
    await user.click(all);
    expect(screen.getByRole("checkbox", { name: "Select demo.mp4" })).toBeChecked();
  });
  it("filters by search and renders the grid view", async () => {
    const user = userEvent.setup();
    render(<FileBrowser entries={entries} view="grid" />);
    expect(screen.getByRole("button", { name: /demo.mp4, 143 MB/ })).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox", { name: "Search files" }), "read");
    expect(screen.queryByRole("button", { name: /demo.mp4/ })).toBeNull();
  });
});
