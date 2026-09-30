import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RadioGroup, RadioGroupOption } from "@/components/ballmac/radio-group";
describe("RadioGroup", () => {
  it("selects described cards and reports the value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <RadioGroup
        aria-label="Digest"
        defaultValue="daily"
        onValueChange={onValueChange}
      >
        <RadioGroupOption
          value="daily"
          title="Daily"
          description="Each morning"
        />
        <RadioGroupOption
          value="weekly"
          title="Weekly"
          description="Each Monday"
        />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio", { name: /Daily/ })).toBeChecked();
    await user.click(screen.getByText("Weekly"));
    expect(screen.getByRole("radio", { name: /Weekly/ })).toBeChecked();
    expect(onValueChange).toHaveBeenCalledWith("weekly");
  });
  it("skips disabled options with the keyboard", async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup aria-label="Digest" defaultValue="daily">
        <RadioGroupOption value="daily" title="Daily" />
        <RadioGroupOption value="weekly" title="Weekly" disabled />
        <RadioGroupOption value="monthly" title="Monthly" />
      </RadioGroup>,
    );
    screen.getByRole("radio", { name: "Daily" }).focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Monthly" })).toHaveFocus();
    await user.keyboard(" ");
    expect(screen.getByRole("radio", { name: "Monthly" })).toBeChecked();
  });
});
