import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Slider } from "@/components/ballmac/slider";

describe("Slider", () => {
  it("names each thumb and changes values with arrow, Home and End keys", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Slider
        defaultValue={[20, 80]}
        thumbLabels={["Minimum", "Maximum"]}
        onValueChange={onValueChange}
      />,
    );
    const min = screen.getByRole("slider", { name: "Minimum" });
    const max = screen.getByRole("slider", { name: "Maximum" });
    min.focus();
    await user.keyboard("{ArrowRight}");
    expect(min).toHaveAttribute("aria-valuenow", "21");
    await user.keyboard("{Home}");
    expect(onValueChange).toHaveBeenLastCalledWith([0, 80]);
    max.focus();
    await user.keyboard("{End}");
    expect(onValueChange).toHaveBeenLastCalledWith([0, 100]);
    expect(max).toHaveAttribute("aria-valuenow", "100");
  });
  it("passes aria-label to a single thumb and shows the formatted value bubble", () => {
    render(<Slider aria-label="Volume" defaultValue={[40]} showValue formatValue={(v) => `${v}%`} />);
    const thumb = screen.getByRole("slider", { name: "Volume" });
    expect(thumb).toHaveAttribute("aria-valuetext", "40%");
    expect(thumb).toHaveTextContent("40%");
  });
  it("stays controlled", async () => {
    const user = userEvent.setup();
    render(<Slider aria-label="Level" value={[10]} />);
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{ArrowRight}");
    expect(thumb).toHaveAttribute("aria-valuenow", "10");
  });
  it("does not respond when disabled", () => {
    render(<Slider aria-label="Locked" defaultValue={[10]} disabled />);
    expect(screen.getByRole("slider")).toHaveAttribute("data-disabled");
  });
});
