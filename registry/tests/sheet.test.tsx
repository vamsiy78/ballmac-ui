import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ballmac/sheet";

function setup(side?: "left" | "bottom") {
  render(
    <Sheet>
      <SheetTrigger>Open</SheetTrigger>
      <SheetContent side={side}>
        <SheetTitle>Settings</SheetTitle>
        <SheetDescription>Adjust preferences.</SheetDescription>
        <button type="button">Save</button>
      </SheetContent>
    </Sheet>,
  );
}

describe("Sheet", () => {
  it("opens as a named dialog, traps focus, and restores focus on Escape", async () => {
    const user = userEvent.setup();
    setup();
    const trigger = screen.getByRole("button", { name: "Open" });
    await user.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Settings" });
    expect(dialog).toHaveAttribute("data-side", "right");
    expect(dialog).toHaveAccessibleDescription("Adjust preferences.");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
  it("closes with the labelled close button and reports its side", async () => {
    const user = userEvent.setup();
    setup("bottom");
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByRole("dialog")).toHaveAttribute("data-side", "bottom");
    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
