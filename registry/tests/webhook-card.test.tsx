import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WebhookCard, type WebhookDelivery } from "@/components/ballmac/webhook-card";

const good: WebhookDelivery[] = [{ id: "a", event: "invoice.paid", status: 200, duration: 120, time: "2026-09-30T14:02:11Z", payload: '{ "id": 1 }', response: '{ "ok": true }' }];
const bad: WebhookDelivery[] = [
  { id: "b", event: "order.created", status: 500, time: "2026-09-30T14:00:00Z" },
  { id: "c", event: "order.created", status: 0, time: "2026-09-30T13:00:00Z" },
  { id: "d", event: "order.paid", status: 200, time: "2026-09-30T12:00:00Z" },
];

describe("WebhookCard", () => {
  it("shows health in words and the sign of each status code", () => {
    const { rerender } = render(<WebhookCard url="https://x.example.com/h" deliveries={good} />);
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("100% of 1 deliveries succeeded")).toBeInTheDocument();
    rerender(<WebhookCard url="https://x.example.com/h" deliveries={bad} />);
    expect(screen.getByText("Failing")).toBeInTheDocument();
    expect(screen.getByText(", Server error")).toBeInTheDocument();
    expect(screen.getByText(", No response")).toBeInTheDocument();
  });
  it("toggles the endpoint with the switch", async () => {
    const user = userEvent.setup();
    const onEnabledChange = vi.fn();
    render(<WebhookCard url="https://x.example.com/h" onEnabledChange={onEnabledChange} />);
    const toggle = screen.getByRole("switch", { name: "Send events to this endpoint" });
    expect(toggle).toBeChecked();
    await user.click(toggle);
    expect(onEnabledChange).toHaveBeenCalledWith(false);
    expect(screen.getByText("Disabled")).toBeInTheDocument();
  });
  it("masks the secret until revealed and copies it", async () => {
    const user = userEvent.setup();
    render(<WebhookCard url="https://x.example.com/h" secret="whsec_abcdef123456" />);
    expect(screen.queryByText("whsec_abcdef123456")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Reveal signing secret" }));
    expect(screen.getByText("whsec_abcdef123456")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Copy signing secret" }));
    expect(await navigator.clipboard.readText()).toBe("whsec_abcdef123456");
  });
  it("opens a delivery with the keyboard and redelivers", async () => {
    const user = userEvent.setup();
    const onRedeliver = vi.fn();
    render(<WebhookCard url="https://x.example.com/h" deliveries={good} onRedeliver={onRedeliver} />);
    const row = screen.getByRole("button", { name: /invoice\.paid/ });
    row.focus();
    await user.keyboard("{Enter}");
    expect(row).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: "Request body of invoice.paid" })).toHaveTextContent('"id"');
    await user.click(screen.getByRole("button", { name: "Redeliver" }));
    expect(onRedeliver).toHaveBeenCalledWith(good[0]);
  });
});
