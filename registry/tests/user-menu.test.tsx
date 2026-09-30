import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UserMenu } from "@/components/ballmac/user-menu";

const user = { name: "Jordan Rivera", email: "jordan@acme.example", plan: "Pro" };

describe("UserMenu", () => {
  it("names the trigger after the person and opens a menu with header, links and sign out", async () => {
    const u = userEvent.setup();
    const onSignOut = vi.fn();
    render(<UserMenu user={user} groups={[[{ label: "Profile", href: "/profile" }, { label: "Billing", onSelect: () => undefined, badge: "Due" }]]} onSignOut={onSignOut} />);
    const trigger = screen.getByRole("button", { name: "Account menu for Jordan Rivera" });
    trigger.focus();
    await u.keyboard("{Enter}");
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(screen.getByText("jordan@acme.example")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Profile" })).toHaveAttribute("href", "/profile");
    await u.click(screen.getByRole("menuitem", { name: "Sign out" }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });
  it("offers a theme submenu with radio choices", async () => {
    const u = userEvent.setup();
    const onThemeChange = vi.fn();
    render(<UserMenu user={user} theme="system" onThemeChange={onThemeChange} />);
    await u.click(screen.getByRole("button", { name: /Account menu/ }));
    const sub = await screen.findByRole("menuitem", { name: /Theme/ });
    sub.focus();
    await u.keyboard("{ArrowRight}");
    await screen.findByRole("menuitemradio", { name: "Dark" });
    expect(screen.getByRole("menuitemradio", { name: "System" })).toHaveAttribute("aria-checked", "true");
    await u.keyboard("{ArrowDown}{Enter}");
    expect(onThemeChange).toHaveBeenCalledWith("dark");
  });
  it("shows the full trigger with name and email and closes on Escape", async () => {
    const u = userEvent.setup();
    render(<UserMenu user={user} variant="full" />);
    const trigger = screen.getByRole("button", { name: /Jordan Rivera/ });
    await u.click(trigger);
    await screen.findByRole("menu");
    await u.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
});
