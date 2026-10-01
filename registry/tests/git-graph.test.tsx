import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GitGraph, layoutCommits, type GitCommit } from "@/components/ballmac/git-graph";

const commits: GitCommit[] = [
  { hash: "m1", parents: ["a2", "b1"], message: "Merge feature", author: "Priya", date: "2026-09-29T10:00:00Z", branches: ["main"] },
  { hash: "b1", parents: ["a1"], message: "Feature work", author: "Marco", date: "2026-09-28T10:00:00Z", branches: ["feature/x"] },
  { hash: "a2", parents: ["a1"], message: "Main work", author: "Priya", date: "2026-09-27T10:00:00Z", tags: ["v1.1"] },
  { hash: "a1", parents: [], message: "Initial commit", author: "Priya", date: "2026-09-26T10:00:00Z" },
];

describe("GitGraph layout", () => {
  it("puts a branch in its own lane and merges back", () => {
    const { rows, width } = layoutCommits(commits);
    expect(width).toBe(2);
    expect(rows[0]!.col).toBe(0);
    expect(rows[0]!.outgoing.map((e) => e.to).sort()).toEqual([0, 1]);
    expect(rows[1]!.col).toBe(1);
    expect(rows[2]!.col).toBe(0);
    expect(rows[2]!.outgoing).toEqual([expect.objectContaining({ from: 0, to: 1 })]);
    expect(rows[3]!.col).toBe(1);
  });
  it("keeps linear history in one lane", () => {
    const linear: GitCommit[] = [
      { hash: "c", parents: ["b"], message: "c", author: "x", date: "2026-01-03T00:00:00Z" },
      { hash: "b", parents: ["a"], message: "b", author: "x", date: "2026-01-02T00:00:00Z" },
      { hash: "a", parents: [], message: "a", author: "x", date: "2026-01-01T00:00:00Z" },
    ];
    expect(layoutCommits(linear).width).toBe(1);
  });
});

describe("GitGraph", () => {
  it("is a listbox of options that describe themselves", () => {
    render(<GitGraph commits={commits} />);
    expect(screen.getByRole("listbox", { name: "Commit history" })).toBeInTheDocument();
    const merge = screen.getAllByRole("option")[0]!;
    expect(merge).toHaveAccessibleName(/Merge feature, by Priya, Sep 29, m1, merge commit, branch main/);
    expect(screen.getAllByRole("option")[2]).toHaveAccessibleName(/tag v1\.1/);
  });
  it("moves with the arrow keys and selects with Enter", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<GitGraph commits={commits} onSelect={onSelect} />);
    await user.tab();
    const list = screen.getByRole("listbox");
    expect(list).toHaveAttribute("aria-activedescendant", screen.getAllByRole("option")[0]!.id);
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(list).toHaveAttribute("aria-activedescendant", screen.getAllByRole("option")[2]!.id);
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("a2", commits[2]);
    expect(screen.getAllByRole("option")[2]).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{End}");
    expect(list).toHaveAttribute("aria-activedescendant", screen.getAllByRole("option")[3]!.id);
  });
  it("selects on click", async () => {
    const user = userEvent.setup();
    render(<GitGraph commits={commits} />);
    await user.click(screen.getAllByRole("option")[1]!);
    expect(screen.getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true");
  });
});
