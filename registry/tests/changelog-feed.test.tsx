import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ChangelogFeed, type ChangelogEntry } from "@/components/ballmac/changelog-feed";

const entries: ChangelogEntry[] = [
  {
    id: "a",
    version: "2.0.0",
    date: "2026-09-24",
    title: "Big release",
    changes: [
      { type: "new", text: "New thing one" },
      { type: "new", text: "New thing two" },
      { type: "fixed", text: "Fixed thing" },
    ],
  },
  { id: "b", version: "1.9.0", date: "2026-08-01", title: "Small release", changes: [{ type: "improved", text: "Faster" }] },
];

describe("ChangelogFeed", () => {
  it("renders articles with dates, versions and a latest marker", () => {
    render(<ChangelogFeed entries={entries} />);
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.getByRole("article", { name: "Big release" })).toBeInTheDocument();
    expect(screen.getByText("September 24, 2026")).toHaveAttribute("datetime", "2026-09-24");
    expect(screen.getByText("v2.0.0")).toBeInTheDocument();
    expect(screen.getAllByText("Latest")).toHaveLength(1);
  });
  it("filters by change type with counts and hides releases without matches", async () => {
    const user = userEvent.setup();
    render(<ChangelogFeed entries={entries} />);
    expect(screen.getByRole("button", { name: /^All/ })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: /Improved/ }));
    expect(screen.getByRole("button", { name: /Improved/ })).toHaveAttribute("aria-pressed", "true");
    expect(await screen.findByText("Faster")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("New thing one")).not.toBeInTheDocument());
  });
  it("collapses long releases and expands them", async () => {
    const user = userEvent.setup();
    render(<ChangelogFeed entries={entries} collapsedCount={2} />);
    expect(screen.queryByText("Fixed thing")).not.toBeInTheDocument();
    const more = screen.getByRole("button", { name: "Show 1 more change" });
    expect(more).toHaveAttribute("aria-expanded", "false");
    await user.click(more);
    expect(screen.getByText("Fixed thing")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show fewer changes" })).toHaveAttribute("aria-expanded", "true");
  });
});
