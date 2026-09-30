import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WorkspaceCard } from "@/components/ballmac/workspace-card";

const workspace = {
  name: "Acme Inc.",
  description: "Product and design.",
  plan: "Team",
  members: [{ name: "Ana Lima" }, { name: "Kofi Mensah" }],
  memberCount: 12,
  projects: 18,
  storage: { used: 62, total: 100, unit: "GB" },
};

describe("WorkspaceCard", () => {
  it("makes the title the single link, shows stats and a current badge", () => {
    render(<WorkspaceCard workspace={workspace} href="/acme" current />);
    const link = screen.getByRole("link", { name: "Acme Inc." });
    expect(link).toHaveAttribute("href", "/acme");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: "Storage used" })).toHaveAttribute("aria-valuenow", "62");
  });
  it("uses a button when there is no href and opens the actions menu", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onLeave = vi.fn();
    render(<WorkspaceCard workspace={workspace} onOpen={onOpen} actions={[{ label: "Settings", onSelect: () => undefined }, { label: "Leave", onSelect: onLeave, destructive: true }]} />);
    await user.click(screen.getByRole("button", { name: "Acme Inc." }));
    expect(onOpen).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Acme Inc. actions" }));
    await user.click(await screen.findByRole("menuitem", { name: "Leave" }));
    expect(onLeave).toHaveBeenCalledOnce();
  });
  it("renders a busy placeholder while loading", () => {
    render(<WorkspaceCard loading />);
    expect(screen.getByLabelText("Loading workspace")).toHaveAttribute("aria-busy", "true");
  });
});
