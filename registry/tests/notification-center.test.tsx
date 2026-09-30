import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NotificationCenter, type NotificationItem } from "@/components/ballmac/notification-center";

const items: NotificationItem[] = [
  { id: "1", title: "Ana commented", time: "5m", group: "Today" },
  { id: "2", title: "Build passed", time: "1h", group: "Today", read: true },
  { id: "3", title: "Invoice paid", time: "Mon", group: "Earlier", read: true },
];

describe("NotificationCenter", () => {
  it("includes the unread count in the button's name and opens a labelled panel", async () => {
    const user = userEvent.setup();
    render(<NotificationCenter notifications={items} />);
    const bell = screen.getByRole("button", { name: "Notifications, 1 unread" });
    await user.click(bell);
    const panel = await screen.findByRole("dialog", { name: "Notifications" });
    expect(within(panel).getByText("Today")).toBeInTheDocument();
    expect(within(panel).getByText("Earlier")).toBeInTheDocument();
    expect(within(panel).getByText("Ana commented")).toBeInTheDocument();
  });
  it("filters to unread, marks items read and dismisses", async () => {
    const user = userEvent.setup();
    const onMarkRead = vi.fn();
    const onMarkAllRead = vi.fn();
    const onDismiss = vi.fn();
    render(<NotificationCenter notifications={items} defaultOpen onMarkRead={onMarkRead} onMarkAllRead={onMarkAllRead} onDismiss={onDismiss} />);
    await user.click(await screen.findByRole("tab", { name: /Unread/ }));
    // Rows leave with a height animation that jsdom cannot complete; the browser check covers the removal itself.
    expect(screen.getByRole("tab", { name: /Unread/ })).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByRole("button", { name: 'Mark "Ana commented" as read' }));
    expect(onMarkRead).toHaveBeenCalledWith("1");
    await user.click(screen.getByRole("button", { name: 'Dismiss "Ana commented"' }));
    expect(onDismiss).toHaveBeenCalledWith("1");
    await user.click(screen.getByRole("button", { name: "Mark all as read" }));
    expect(onMarkAllRead).toHaveBeenCalledOnce();
  });
  it("shows an empty message and no badge when there is nothing", async () => {
    render(<NotificationCenter notifications={[]} defaultOpen emptyText="Nothing here." />);
    expect(await screen.findByText("Nothing here.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark all as read" })).toBeDisabled();
  });
});
