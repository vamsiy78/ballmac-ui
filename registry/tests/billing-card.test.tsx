import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BillingCard } from "@/components/ballmac/billing-card";

const base = { name: "Team", price: 49, interval: "month" as const, status: "active" as const, renewsOn: "2026-10-28", seats: { used: 8, total: 10 } };

describe("BillingCard", () => {
  it("shows plan, price, date, payment method, seats and invoices", () => {
    render(
      <BillingCard
        plan={base}
        paymentMethod={{ brand: "Visa", last4: "4242", expires: "08/28" }}
        invoices={[{ id: "INV-1", date: "2026-09-28", amount: 49, status: "paid", href: "#inv" }]}
      />,
    );
    expect(screen.getByRole("region", { name: "Team" })).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Oct 28, 2026")).toBeInTheDocument();
    expect(screen.getByText(/Visa •••• 4242/)).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: "Seats used" })).toHaveAttribute("aria-valuenow", "8");
    expect(screen.getByRole("link", { name: "Download invoice INV-1" })).toHaveAttribute("href", "#inv");
    expect(screen.getByText("$49.00")).toBeInTheDocument();
  });
  it("announces a failed payment and calls the action handlers", async () => {
    const user = userEvent.setup();
    const onUpdatePayment = vi.fn();
    const onCancel = vi.fn();
    const onChangePlan = vi.fn();
    render(
      <BillingCard
        plan={{ ...base, status: "past_due" }}
        paymentMethod={{ brand: "Visa", last4: "0001", expires: "01/26" }}
        onUpdatePayment={onUpdatePayment}
        onCancel={onCancel}
        onChangePlan={onChangePlan}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("could not charge");
    await user.click(screen.getByRole("button", { name: "Update" }));
    await user.click(screen.getByRole("button", { name: "Change plan" }));
    await user.click(screen.getByRole("button", { name: "Cancel subscription" }));
    expect(onUpdatePayment).toHaveBeenCalledOnce();
    expect(onChangePlan).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });
  it("uses trial wording and hides cancel for canceled plans", () => {
    const { rerender } = render(<BillingCard plan={{ name: "Pro", price: 0, interval: "month", status: "trialing", trialEndsOn: "2026-10-12" }} />);
    expect(screen.getByText("Trial ends")).toBeInTheDocument();
    rerender(<BillingCard plan={{ ...base, status: "canceled" }} onCancel={() => undefined} />);
    expect(screen.getByText("Access ends")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancel subscription" })).not.toBeInTheDocument();
  });
});
