import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { vi } from "vitest";
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => motion.reduce }));

import { BlurFade, BlurFadeGroup } from "@/components/ballmac/blur-fade";

afterEach(() => {
  motion.reduce = false;
});

describe("BlurFade", () => {
  it("renders its content and reaches full opacity", async () => {
    render(<BlurFade inView={false}>Hello</BlurFade>);
    const el = screen.getByText("Hello");
    expect(el).toHaveAttribute("data-slot", "blur-fade");
    await waitFor(() => expect(el.style.opacity).toBe("1"));
  });
  it("shows content at once under reduced motion", async () => {
    motion.reduce = true;
    render(<BlurFade inView={false} blur={20}>Still</BlurFade>);
    await waitFor(() => expect(screen.getByText("Still").style.opacity).toBe("1"));
    expect(screen.getByText("Still").style.filter).toBe("blur(0px)");
  });
  it("renders the chosen element", () => {
    render(
      <ul>
        <BlurFade as="li">Item</BlurFade>
      </ul>
    );
    expect(screen.getByRole("listitem")).toHaveTextContent("Item");
  });
  it("wraps every child of a group", () => {
    render(
      <BlurFadeGroup stagger={0.2}>
        <p>One</p>
        <p>Two</p>
        <p>Three</p>
      </BlurFadeGroup>
    );
    expect(document.querySelectorAll("[data-slot=blur-fade]")).toHaveLength(3);
  });
});
