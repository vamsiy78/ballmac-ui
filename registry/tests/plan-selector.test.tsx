import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PlanSelector, type PlanOption } from "@/components/ballmac/plan-selector";

const plans: PlanOption[] = [
  { id: "free", name: "Free", price: { monthly: 0, yearly: 0 }, features: ["1 project"] },
  { id: "team", name: "Team", price: { monthly: 24, yearly: 19 }, highlight: "Most popular", features: ["Unlimited projects"] },
  { id: "scale", name: "Scale", price: { monthly: 59, yearly: 49 }, features: ["SSO"], disabled: true },
];

describe("PlanSelector", () => {
  it("is a radio group with the highlighted plan selected, and arrow keys change the choice", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<PlanSelector plans={plans} onValueChange={onValueChange} name="plan" />);
    expect(screen.getByRole("group", { name: "Choose a plan" })).toBeInTheDocument();
    const team = screen.getByRole("radio", { name: /Team/ });
    expect(team).toBeChecked();
    team.focus();
    await user.keyboard("{ArrowLeft}");
    expect(onValueChange).toHaveBeenCalledWith("free");
    expect(screen.getByRole("radio", { name: /Scale/ })).toBeDisabled();
  });
  it("re-prices every plan when the billing period changes", async () => {
    const user = userEvent.setup();
    const onBillingChange = vi.fn();
    render(<PlanSelector plans={plans} defaultBilling="monthly" onBillingChange={onBillingChange} />);
    expect(screen.getByText("$24")).toBeInTheDocument();
    expect(screen.getAllByText("Billed monthly")).toHaveLength(2);
    await user.click(screen.getByRole("radio", { name: /Yearly/ }));
    expect(onBillingChange).toHaveBeenCalledWith("yearly");
    expect(await screen.findByText("$19")).toBeInTheDocument();
    expect(screen.getByText("Billed $228 per year")).toBeInTheDocument();
  });
  it("submits the chosen plan with a native form and shows the savings chip", () => {
    const { container } = render(
      <form>
        <PlanSelector plans={plans} name="plan" defaultValue="free" />
      </form>,
    );
    expect(new FormData(container.querySelector("form")!).get("plan")).toBe("free");
    expect(screen.getByText("Save 21%")).toBeInTheDocument();
  });
});
