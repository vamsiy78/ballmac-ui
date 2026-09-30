import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { OnboardingChecklist } from "@/components/ballmac/onboarding-checklist";

const steps = [
  { id: "a", title: "Create a project", description: "Start from a template.", action: { label: "Create" } },
  { id: "b", title: "Invite your team", description: "Send invitations." },
];

describe("OnboardingChecklist", () => {
  it("opens the first unfinished step and expands others with their header button", async () => {
    const user = userEvent.setup();
    render(<OnboardingChecklist steps={steps} defaultCompleted={[]} />);
    expect(screen.getByRole("button", { name: "Create a project" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Invite your team" }));
    expect(screen.getByRole("button", { name: "Invite your team" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Send invitations.")).toBeInTheDocument();
  });
  it("checks a step with the keyboard, reports the list, and advances to the next step", async () => {
    const user = userEvent.setup();
    const onCompletedChange = vi.fn();
    render(<OnboardingChecklist steps={steps} onCompletedChange={onCompletedChange} />);
    const box = screen.getByRole("checkbox", { name: /Create a project/ });
    expect(box).toHaveAttribute("aria-checked", "false");
    box.focus();
    await user.keyboard(" ");
    expect(onCompletedChange).toHaveBeenCalledWith(["a"]);
    expect(screen.getByRole("checkbox", { name: /Create a project/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("button", { name: "Invite your team" })).toHaveAttribute("aria-expanded", "true");
  });
  it("shows the celebration when all steps are done and can dismiss", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<OnboardingChecklist steps={steps} defaultCompleted={["a", "b"]} completeMessage="All done!" onDismiss={onDismiss} />);
    expect(await screen.findByText("All done!")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Dismiss checklist" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
