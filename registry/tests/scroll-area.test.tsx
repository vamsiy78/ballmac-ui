import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScrollArea } from "@/components/ballmac/scroll-area";
describe("ScrollArea", () => {
  it("exposes a named focusable region for keyboard scrolling", () => {
    render(
      <ScrollArea label="Activity" className="h-32">
        Long list
      </ScrollArea>,
    );
    const region = screen.getByRole("region", { name: "Activity" });
    expect(region).toHaveAttribute("tabindex", "0");
    region.focus();
    expect(region).toHaveFocus();
  });
});
