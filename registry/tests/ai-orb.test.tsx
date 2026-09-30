import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AiOrb } from "@/components/ballmac/ai-orb";

describe("AiOrb", () => {
  it("names itself from its state", () => {
    const { rerender } = render(<AiOrb state="thinking" />);
    expect(screen.getByRole("img", { name: "Assistant is thinking" })).toBeInTheDocument();
    rerender(<AiOrb state="listening" />);
    expect(screen.getByRole("img", { name: "Assistant is listening" })).toHaveAttribute("data-state", "listening");
  });
  it("accepts a custom label", () => {
    render(<AiOrb label="Nova is speaking" />);
    expect(screen.getByRole("img", { name: "Nova is speaking" })).toBeInTheDocument();
  });
  it("hides from assistive tech when label is null", () => {
    const { container } = render(<AiOrb label={null} />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
  it("tolerates out-of-range levels", () => {
    expect(() => render(<AiOrb state="speaking" level={4} />)).not.toThrow();
    expect(() => render(<AiOrb state="speaking" level={Number.NaN} />)).not.toThrow();
  });
});
