import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TokenMeter, TokenMeterPill, estimateTokens, formatTokens } from "@/components/ballmac/token-meter";

const segments = [
  { label: "System", tokens: 2_000 },
  { label: "Conversation", tokens: 100_000 },
  { label: "Reply", tokens: 10_000, reserved: true },
];

describe("TokenMeter", () => {
  it("exposes a meter with a readable value and ignores reserved tokens in the total", () => {
    render(<TokenMeter segments={segments} limit={200_000} />);
    const meter = screen.getByRole("meter", { name: "Context window" });
    expect(meter).toHaveAttribute("aria-valuenow", "102000");
    expect(meter.getAttribute("aria-valuetext")).toContain("102k of 200k tokens used, 51%");
    expect(screen.getByText("reserved")).toBeInTheDocument();
  });
  it("warns in words and shows the action only when near the limit", () => {
    const action = <button type="button">Compact</button>;
    const { rerender } = render(<TokenMeter segments={segments} limit={200_000} action={action} />);
    expect(screen.queryByRole("button", { name: "Compact" })).toBeNull();
    rerender(<TokenMeter segments={[{ label: "Conversation", tokens: 170_000 }]} limit={200_000} action={action} />);
    expect(screen.getByRole("status")).toHaveTextContent("Nearing the limit");
    expect(screen.getByRole("button", { name: "Compact" })).toBeInTheDocument();
    rerender(<TokenMeter segments={[{ label: "Conversation", tokens: 210_000 }]} limit={200_000} action={action} />);
    expect(screen.getByRole("status")).toHaveTextContent("Context is full");
  });
  it("opens the full meter from the pill", async () => {
    const user = userEvent.setup();
    render(<TokenMeterPill segments={segments} limit={200_000} cost="$0.12" />);
    const pill = screen.getByRole("button", { name: /Context window: 51% used/ });
    await user.click(pill);
    expect(await screen.findByRole("meter")).toBeInTheDocument();
    expect(screen.getByText("≈ $0.12")).toBeInTheDocument();
  });
  it("formats and estimates", () => {
    expect(formatTokens(950)).toBe("950");
    expect(formatTokens(12_400)).toBe("12.4k");
    expect(formatTokens(1_250_000)).toBe("1.25M");
    expect(estimateTokens("abcdefgh")).toBe(2);
  });
});
