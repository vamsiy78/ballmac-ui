import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ballmac/popover";
describe("Popover", () => {
  it("opens with Enter and returns focus after Escape", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Share settings</PopoverTrigger>
        <PopoverContent label="Share settings">
          <button type="button">Copy link</button>
        </PopoverContent>
      </Popover>,
    );
    const trigger = screen.getByRole("button", { name: "Share settings" });
    trigger.focus();
    await user.keyboard("{Enter}");
    const panel = await screen.findByRole("dialog", { name: "Share settings" });
    expect(panel).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });
  it("closes with its labelled close control", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Edit</PopoverTrigger>
        <PopoverContent showCloseButton label="Editor">
          Editor content
        </PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(
      await screen.findByRole("button", { name: "Close popover" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });
});
