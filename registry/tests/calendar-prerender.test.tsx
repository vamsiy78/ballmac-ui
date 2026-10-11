import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// While a page is prerendered with Cache Components, reading the current time suspends the component. Simulate that.
vi.mock("react-day-picker", () => ({
  DayPicker: () => {
    throw new Promise(() => {});
  },
}));
import { Calendar } from "@/components/ballmac/calendar";

describe("Calendar while prerendering", () => {
  it("shows a same-size placeholder instead of the grid", () => {
    const { container } = render(<Calendar mode="single" numberOfMonths={2} bordered className="custom" />);
    const placeholder = container.querySelector('[data-slot="calendar"]') as HTMLElement;
    expect(placeholder).toHaveAttribute("aria-hidden", "true");
    expect(placeholder).toHaveClass("custom", "w-fit");
    expect(placeholder.style.width).toContain("* 2");
    expect(placeholder.style.height).toContain("--cell-size");
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });
});
