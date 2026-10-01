import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TextAnimate } from "@/components/ballmac/text-animate";

describe("TextAnimate", () => {
  it("keeps the full text for screen readers and hides the pieces", () => {
    const { container } = render(<TextAnimate by="word">Design systems alive</TextAnimate>);
    expect(container.querySelector(".sr-only")).toHaveTextContent("Design systems alive");
    const pieces = container.querySelectorAll("[aria-hidden=true] > span");
    expect(pieces).toHaveLength(3);
  });
  it("splits by character, grouping letters into words", () => {
    const { container } = render(<TextAnimate by="character">Hi you</TextAnimate>);
    expect(container.querySelectorAll("[aria-hidden=true] span span")).toHaveLength(5);
  });
  it("splits by line at newlines", () => {
    const { container } = render(<TextAnimate by="line">{"one\ntwo\nthree"}</TextAnimate>);
    expect(container.querySelectorAll("br")).toHaveLength(2);
    expect(container.querySelectorAll("[aria-hidden=true] > span")).toHaveLength(3);
  });
  it("renders the chosen element", () => {
    render(<TextAnimate as="h2">Title</TextAnimate>);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Title");
  });
});
