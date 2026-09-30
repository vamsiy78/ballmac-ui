import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UsageMeter } from "@/components/ballmac/usage-meter";

describe("UsageMeter", () => {
  it("exposes a named meter with a readable value", () => {
    render(<UsageMeter label="Storage" used={42} limit={100} unit="GB" />);
    const meter = screen.getByRole("meter", { name: "Storage" });
    expect(meter).toHaveAttribute("aria-valuenow", "42");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
    expect(meter).toHaveAttribute("aria-valuetext", expect.stringContaining("42 of 100 GB"));
    expect(screen.getByText("42% used")).toBeInTheDocument();
  });
  it("switches to warning and over-limit states with words, not just color", () => {
    const { rerender, container } = render(<UsageMeter label="Seats" used={85} limit={100} />);
    expect(container.firstChild).toHaveAttribute("data-state", "warn");
    expect(screen.getByText(/nearing the limit/)).toBeInTheDocument();
    rerender(<UsageMeter label="Seats" used={120} limit={100} />);
    expect(container.firstChild).toHaveAttribute("data-state", "over");
    expect(screen.getByText("Over limit")).toBeInTheDocument();
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "100");
  });
  it("sums segments and lists them", () => {
    render(<UsageMeter label="Storage" limit={100} unit="GB" segments={[{ label: "Images", value: 30 }, { label: "Video", value: 20.5 }]} />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "50.5");
    expect(screen.getByText("Images")).toBeInTheDocument();
    expect(screen.getByText("30 GB")).toBeInTheDocument();
  });
});
