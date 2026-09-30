import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApprovalCard } from "@/components/ballmac/approval-card";

describe("ApprovalCard", () => {
  afterEach(() => vi.useRealTimers());

  it("states risk in words and names the region by its title", () => {
    render(<ApprovalCard title="Run a command" risk="high" preview="rm -rf build" details={[{ label: "Directory", value: "~/app" }]} />);
    expect(screen.getByRole("region", { name: "Run a command" })).toBeInTheDocument();
    expect(screen.getByText("High risk")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Exactly what will run" })).toHaveTextContent("rm -rf build");
    expect(screen.getByText("Directory").tagName).toBe("DT");
  });
  it("approves with the keyboard, shows the decision and moves focus to it", async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn();
    render(<ApprovalCard title="Edit files" onApprove={onApprove} resolvedNote="by you" />);
    await user.tab();
    expect(screen.getByRole("button", { name: "Approve" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onApprove).toHaveBeenCalledOnce();
    const status = screen.getAllByRole("status")[0]!;
    expect(status).toHaveTextContent("Approved");
    expect(status).toHaveTextContent("by you");
    expect(status).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Approve" })).toBeNull();
  });
  it("denies and supports always allow", async () => {
    const user = userEvent.setup();
    const onDeny = vi.fn();
    const onAlways = vi.fn();
    const { unmount } = render(<ApprovalCard title="A" onDeny={onDeny} onAlwaysAllow={onAlways} />);
    await user.click(screen.getByRole("button", { name: "Deny" }));
    expect(onDeny).toHaveBeenCalledOnce();
    expect(screen.getByRole("status")).toHaveTextContent("Denied");
    unmount();
    render(<ApprovalCard title="B" onAlwaysAllow={onAlways} />);
    await user.click(screen.getByRole("button", { name: "Always allow" }));
    expect(onAlways).toHaveBeenCalledOnce();
  });
  it("counts down and denies itself", () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();
    render(<ApprovalCard title="Timed" expiresIn={3} onExpire={onExpire} />);
    expect(screen.getByText("Denies itself in 3s")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(3200); });
    expect(onExpire).toHaveBeenCalledOnce();
    expect(screen.getByRole("status")).toHaveTextContent("Timed out and denied");
  });
  it("follows a controlled status", () => {
    render(<ApprovalCard title="C" status="denied" />);
    expect(screen.queryByRole("button", { name: "Approve" })).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Denied");
  });
});
