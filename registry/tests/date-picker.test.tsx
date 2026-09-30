import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "@/components/ballmac/date-picker";

describe("DatePicker", () => {
  it("opens the calendar, picks a day, closes and restores focus", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DatePicker aria-label="Due" defaultValue={new Date(2026, 8, 10)} onValueChange={onValueChange} />);
    const trigger = screen.getByRole("button", { name: /Due, Sep 10, 2026/ });
    await user.click(trigger);
    await user.click(await screen.findByRole("button", { name: /September 22nd, 2026/ }));
    expect((onValueChange.mock.calls[0][0] as Date).getDate()).toBe(22);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: /Due, Sep 22, 2026/ })).toHaveFocus();
  });
  it("applies presets, clears the value and submits ISO text through a form", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <DatePicker aria-label="Start" name="start" clearable presets={[{ label: "Launch day", date: new Date(2026, 9, 1) }]} />
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Start" }));
    await user.click(await screen.findByRole("button", { name: "Launch day" }));
    expect(new FormData(container.querySelector("form")!).get("start")).toBe("2026-10-01");
    await user.click(screen.getByRole("button", { name: "Clear date" }));
    expect(new FormData(container.querySelector("form")!).get("start")).toBe("");
  });
  it("reflects invalid state and respects disabled", () => {
    render(<DatePicker aria-label="Start" invalid disabled />);
    const trigger = screen.getByRole("button", { name: "Start" });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toBeDisabled();
  });
});
