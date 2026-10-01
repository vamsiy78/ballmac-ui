import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpinningText } from "@/components/ballmac/spinning-text";

describe("SpinningText", () => {
  it("is an image named by its text", () => {
    render(<SpinningText text="  Scroll to explore " />);
    expect(screen.getByRole("img", { name: "Scroll to explore" })).toBeInTheDocument();
  });
  it("lays the text on a circle path", () => {
    const { container } = render(<SpinningText text="Round and round" separator=" - " />);
    const text = container.querySelector("text");
    expect(text?.textContent).toBe("Round and round - ");
    const href = text?.firstElementChild?.getAttribute("href");
    expect(href).toMatch(/^#/);
    expect(container.querySelector("defs path")?.getAttribute("id")).toBe(href?.slice(1));
  });
  it("shows center content normally", () => {
    render(
      <SpinningText text="Hi">
        <button type="button">Go</button>
      </SpinningText>
    );
    expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument();
  });
});
