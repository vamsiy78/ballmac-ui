import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Toggle } from "@/components/ballmac/toggle";
describe("Toggle", () => {
  it("changes pressed state with the keyboard", async () => {
    const user = userEvent.setup();
    render(
      <Toggle aria-label="Pin" variant="outline">
        Pin
      </Toggle>,
    );
    const toggle = screen.getByRole("button", { name: "Pin" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    toggle.focus();
    await user.keyboard("{Enter}");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(toggle).toHaveAttribute("data-variant", "outline");
  });
  it("reports controlled changes", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    render(
      <Toggle pressed={false} onPressedChange={onPressedChange}>
        Pin
      </Toggle>,
    );
    await user.click(screen.getByRole("button", { name: "Pin" }));
    expect(onPressedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button", { name: "Pin" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
