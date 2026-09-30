import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScrollProgress } from "@/components/ballmac/scroll-progress";

describe("ScrollProgress", () => {
  it("is decorative, positioned on the requested edge and sized by thickness", () => {
    const { container, rerender } = render(<ScrollProgress thickness={5} />);
    const bar = container.querySelector("[data-slot=scroll-progress]")!;
    expect(bar).toHaveAttribute("aria-hidden", "true");
    expect(bar).toHaveClass("top-0");
    expect((bar as HTMLElement).style.height).toBe("5px");
    rerender(<ScrollProgress position="bottom" />);
    expect(container.querySelector("[data-slot=scroll-progress]")).toHaveClass("bottom-0");
  });
});
