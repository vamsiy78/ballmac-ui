import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ballmac/sidebar";

function setup(props: Partial<React.ComponentProps<typeof SidebarProvider>> = {}) {
  return render(
    <SidebarProvider {...props}>
      <Sidebar label="Main navigation">
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="/home" isActive>Home</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>Settings</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
      </SidebarInset>
    </SidebarProvider>,
  );
}

describe("Sidebar", () => {
  it("renders a labelled navigation with the current page marked", () => {
    setup();
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    const home = screen.getByRole("link", { name: "Home" });
    expect(home).toHaveAttribute("aria-current", "page");
    expect(home).toHaveAttribute("href", "/home");
    expect(screen.getByRole("button", { name: "Settings" })).toHaveAttribute("type", "button");
  });
  it("toggles with the trigger and with Cmd/Ctrl+B", async () => {
    const user = userEvent.setup();
    const { container } = setup();
    const trigger = screen.getByRole("button", { name: "Toggle sidebar" });
    const state = () => container.querySelector("[data-slot=sidebar]")?.getAttribute("data-state");
    expect(state()).toBe("expanded");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.click(trigger);
    expect(state()).toBe("collapsed");
    await user.keyboard("{Control>}b{/Control}");
    expect(state()).toBe("expanded");
  });
  it("can start collapsed and be controlled", () => {
    const { container } = setup({ defaultOpen: false });
    expect(container.querySelector("[data-slot=sidebar]")).toHaveAttribute("data-collapsible", "icon");
  });
});
