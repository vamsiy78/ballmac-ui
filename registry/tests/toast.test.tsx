import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Toaster, toast } from "@/components/ballmac/toast";

describe("Toast", () => {
  it("shows a toast with a description when called", async () => {
    render(<Toaster />);
    act(() => {
      toast("Event created", { description: "Friday at 10:00" });
    });
    expect(await screen.findByText("Event created")).toBeInTheDocument();
    expect(screen.getByText("Friday at 10:00")).toBeInTheDocument();
  });
  it("runs a toast action and dismisses through the close control", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Toaster />);
    act(() => {
      toast("Archived", { action: { label: "Undo", onClick } });
    });
    await user.click(await screen.findByRole("button", { name: "Undo" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
  it("exposes the notification region as a labelled landmark", async () => {
    render(<Toaster />);
    expect(document.querySelector("[aria-label*='Notifications']")).toBeInTheDocument();
  });
});
