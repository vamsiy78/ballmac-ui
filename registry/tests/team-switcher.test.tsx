import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TeamSwitcher } from "@/components/ballmac/team-switcher";

const teams = [
  { id: "a", name: "Acme Inc.", description: "Pro" },
  { id: "b", name: "Acme Labs", description: "Free" },
];

describe("TeamSwitcher", () => {
  it("shows the active team, lists teams as radio items and switches", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TeamSwitcher teams={teams} onValueChange={onValueChange} />);
    const trigger = screen.getByRole("button", { name: /Acme Inc\./ });
    await user.click(trigger);
    expect(await screen.findByRole("menuitemradio", { name: /Acme Inc\./ })).toHaveAttribute("aria-checked", "true");
    await user.click(screen.getByRole("menuitemradio", { name: /Acme Labs/ }));
    expect(onValueChange).toHaveBeenCalledWith("b");
    await waitFor(() => expect(screen.getByRole("button", { name: /Acme Labs/ })).toBeInTheDocument());
  });
  it("adds a team, and compact mode keeps an accessible name", async () => {
    const user = userEvent.setup();
    const onAddTeam = vi.fn();
    render(<TeamSwitcher teams={teams} onAddTeam={onAddTeam} compact addLabel="New workspace" />);
    const trigger = screen.getByRole("button", { name: "Team: Acme Inc." });
    await user.click(trigger);
    await user.click(await screen.findByRole("menuitem", { name: "New workspace" }));
    expect(onAddTeam).toHaveBeenCalledOnce();
  });
});
