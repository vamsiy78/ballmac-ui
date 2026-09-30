import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "@/components/ballmac/calendar";

describe("Calendar", () => {
  it("selects a day with the keyboard and moves across days with arrows", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Calendar mode="single" defaultMonth={new Date(2026, 8)} onSelect={onSelect} />);
    const day = screen.getByRole("button", { name: /September 10th, 2026/ });
    day.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: /September 11th, 2026/ })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalled();
    expect((onSelect.mock.calls[0][0] as Date).getDate()).toBe(11);
  });
  it("marks selected days and disables days before the minimum", () => {
    render(
      <Calendar
        mode="single"
        selected={new Date(2026, 8, 20)}
        defaultMonth={new Date(2026, 8)}
        disabled={{ before: new Date(2026, 8, 5) }}
      />,
    );
    expect(screen.getByRole("gridcell", { selected: true })).toHaveAttribute("data-day", "2026-09-20");
    expect(screen.getByRole("button", { name: /September 2nd/ })).toBeDisabled();
  });
  it("changes month with the navigation buttons", async () => {
    const user = userEvent.setup();
    render(<Calendar mode="single" defaultMonth={new Date(2026, 8)} />);
    await user.click(screen.getByRole("button", { name: /next month/i }));
    expect(screen.getByText("October 2026")).toBeInTheDocument();
  });
});
