import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AgentPlan, type PlanStep } from "@/components/ballmac/agent-plan";

const steps: PlanStep[] = [
  { id: "a", title: "Read files", status: "done", duration: "1s", detail: "Opened 4 files" },
  { id: "b", title: "Write patch", status: "running", detail: "Editing lib.ts", steps: [{ id: "b1", title: "Edit lib.ts", status: "running" }] },
  { id: "c", title: "Run tests", status: "failed", error: "2 tests failed", detail: "see log" },
  { id: "d", title: "Open PR", status: "pending" },
];

describe("AgentPlan", () => {
  it("reads each step with its status and reports progress", () => {
    render(<AgentPlan steps={steps} title="Fix bug" />);
    expect(screen.getByRole("progressbar", { name: "Fix bug progress" })).toHaveAttribute("aria-valuenow", "1");
    expect(screen.getByRole("button", { name: /Done: Read files/ })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Working on: Write patch");
    expect(screen.getByText("2 tests failed")).toBeInTheDocument();
  });
  it("opens running and failed steps by default and toggles with the keyboard", async () => {
    const user = userEvent.setup();
    render(<AgentPlan steps={steps} />);
    const read = screen.getByRole("button", { name: /Done: Read files/ });
    expect(read).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Editing lib.ts")).toBeInTheDocument();
    read.focus();
    await user.keyboard("{Enter}");
    expect(read).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Opened 4 files")).toBeInTheDocument();
  });
  it("retries a failed step", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<AgentPlan steps={steps} onRetry={onRetry} />);
    await user.click(screen.getByRole("button", { name: "Retry Run tests" }));
    expect(onRetry).toHaveBeenCalledWith(expect.objectContaining({ id: "c" }));
  });
  it("announces completion", () => {
    render(<AgentPlan steps={[{ id: "x", title: "Only", status: "done" }]} />);
    expect(screen.getByRole("status")).toHaveTextContent("Plan complete");
  });
});
