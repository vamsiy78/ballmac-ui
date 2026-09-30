import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "@/components/ballmac/drawer";

describe("Drawer", () => {
  it("opens as a named dialog, closes with Escape and restores focus", async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Order</DrawerTitle>
          <DrawerDescription>Review items.</DrawerDescription>
          <DrawerClose>Done</DrawerClose>
        </DrawerContent>
      </Drawer>,
    );
    const trigger = screen.getByRole("button", { name: "Open" });
    await user.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Order" });
    expect(dialog).toHaveAccessibleDescription("Review items.");
    expect(dialog).toHaveAttribute("data-vaul-drawer-direction", "bottom");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
  it("closes from its close button and supports side directions", async () => {
    const user = userEvent.setup();
    render(
      <Drawer direction="right">
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Panel</DrawerTitle>
          <DrawerClose>Done</DrawerClose>
        </DrawerContent>
      </Drawer>,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByRole("dialog")).toHaveAttribute("data-vaul-drawer-direction", "right");
    // Keyboard activation: Vaul's pointer-release drag math needs real layout, which jsdom lacks.
    screen.getByRole("button", { name: "Done" }).focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
