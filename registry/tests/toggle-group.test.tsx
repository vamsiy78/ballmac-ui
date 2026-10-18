import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ballmac/toggle-group";
describe("ToggleGroup", () => {
  it("selects one item and supports roving focus", async () => {
    const user = userEvent.setup();
    render(
      <ToggleGroup type="single" defaultValue="grid" aria-label="View">
        <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
        <ToggleGroupItem value="list">List</ToggleGroupItem>
      </ToggleGroup>,
    );
    // A single group is radios in Radix UI and toggle buttons in Base UI; the behaviour is the same.
    const item = (name: string) => screen.queryByRole("radio", { name }) ?? screen.getByRole("button", { name });
    const on = (el: HTMLElement) => el.getAttribute("aria-checked") === "true" || el.getAttribute("aria-pressed") === "true";
    item("Grid").focus();
    await user.keyboard("{ArrowRight}{Enter}");
    expect(on(item("List"))).toBe(true);
    expect(on(item("Grid"))).toBe(false);
  });
  it("reports controlled multiple selections", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ToggleGroup
        type="multiple"
        value={["bold"]}
        onValueChange={onValueChange}
        aria-label="Format"
      >
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      </ToggleGroup>,
    );
    await user.click(screen.getByRole("button", { name: "Italic" }));
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(["bold", "italic"]);
    expect(screen.getByRole("button", { name: "Italic" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
