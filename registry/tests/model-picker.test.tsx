import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ModelPicker, formatContext, type ModelOption } from "@/components/ballmac/model-picker";

const models: ModelOption[] = [
  { id: "big", name: "Lyra XL", provider: "Lyra", description: "Hard problems", contextWindow: 1_000_000, cost: 3, capabilities: ["reasoning"] },
  { id: "mid", name: "Lyra Mid", provider: "Lyra", description: "Everyday work", contextWindow: 200_000, cost: 2 },
  { id: "pro", name: "Orion Think", provider: "Orion", locked: true, lockedLabel: "Pro" },
];

describe("ModelPicker", () => {
  it("opens from the keyboard, navigates, and selects", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ModelPicker models={models} defaultValue="big" onValueChange={onValueChange} />);
    const trigger = screen.getByRole("combobox", { name: "Model: Lyra XL" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    expect(await screen.findByRole("option", { name: /Lyra Mid/ })).toBeInTheDocument();
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("mid");
    expect(screen.getByRole("combobox", { name: "Model: Lyra Mid" })).toHaveFocus();
  });
  it("follows the highlighted model in the detail pane", async () => {
    const user = userEvent.setup();
    render(<ModelPicker models={models} defaultValue="big" />);
    await user.click(screen.getByRole("combobox"));
    const aside = await screen.findByRole("complementary", { name: "Model details" });
    expect(aside).toHaveTextContent("Hard problems");
    await user.keyboard("{ArrowDown}");
    expect(aside).toHaveTextContent("Everyday work");
    expect(aside).toHaveTextContent("200k tokens");
  });
  it("does not select a locked model but reports it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onLockedSelect = vi.fn();
    render(<ModelPicker models={models} defaultValue="big" onValueChange={onValueChange} onLockedSelect={onLockedSelect} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: /Orion Think/ }));
    expect(onLockedSelect).toHaveBeenCalledWith(models[2]);
    expect(onValueChange).not.toHaveBeenCalled();
  });
  it("filters with the search box when searchable", async () => {
    const user = userEvent.setup();
    render(<ModelPicker models={models} searchable />);
    await user.click(screen.getByRole("combobox"));
    await user.type(await screen.findByRole("combobox", { name: "Models" }), "mid");
    expect(screen.getAllByRole("option")).toHaveLength(1);
  });
  it("formats context windows", () => {
    expect(formatContext(1_000_000)).toBe("1M");
    expect(formatContext(128_000)).toBe("128k");
  });
});
