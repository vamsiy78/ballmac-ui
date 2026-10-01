import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { vi } from "vitest";
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => motion.reduce }));

import { SparklesText } from "@/components/ballmac/sparkles-text";

afterEach(() => {
  motion.reduce = false;
});

describe("SparklesText", () => {
  it("shows its text and adds decorative stars after mount", async () => {
    const { container } = render(<SparklesText count={6}>Pro plan</SparklesText>);
    expect(screen.getByText("Pro plan")).toBeInTheDocument();
    await waitFor(() => expect(container.querySelectorAll("svg[aria-hidden=true]")).toHaveLength(6));
  });
  it("draws no stars under reduced motion", async () => {
    motion.reduce = true;
    const { container } = render(<SparklesText count={6}>Calm</SparklesText>);
    expect(screen.getByText("Calm")).toBeInTheDocument();
    expect(container.querySelectorAll("svg")).toHaveLength(0);
  });
  it("can fill the text with a gradient", () => {
    render(<SparklesText gradient>Shiny</SparklesText>);
    expect(screen.getByText("Shiny")).toHaveClass("bg-clip-text");
  });
});
