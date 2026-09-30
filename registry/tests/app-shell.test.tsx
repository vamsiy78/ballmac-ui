import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AppShell, AppShellAside, AppShellHeader, AppShellMain, AppShellSidebar, AppShellSidebarTrigger, AppShellSkipLink } from "@/components/ballmac/app-shell";

function setup() {
  return render(
    <AppShell>
      <AppShellSkipLink />
      <AppShellHeader>
        <AppShellSidebarTrigger />
      </AppShellHeader>
      <AppShellSidebar label="Workspace">
        <a href="/home">Home</a>
      </AppShellSidebar>
      <AppShellMain>Content</AppShellMain>
      <AppShellAside label="Activity">Feed</AppShellAside>
    </AppShell>,
  );
}

describe("AppShell", () => {
  it("provides landmarks and a skip link to the main content", () => {
    setup();
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#app-main");
    expect(screen.getByRole("main")).toHaveAttribute("id", "app-main");
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "Workspace" })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "Activity" })).toBeInTheDocument();
  });
  it("opens the sidebar as a dialog from the trigger and closes with Escape", async () => {
    const user = userEvent.setup();
    setup();
    const trigger = screen.getByRole("button", { name: "Open navigation" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(await screen.findByRole("dialog", { name: "Workspace" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
