import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { StatusBadgeRow } from "@/components/ballmac/status-badge-row";

const days = ["operational", "operational", { status: "degraded", note: "Slow" }, "outage"] as const;

describe("StatusBadgeRow", () => {
  it("shows the worst status in the banner and a word for each service", () => {
    render(
      <StatusBadgeRow
        services={[
          { name: "API", status: "outage", days: [...days] },
          { name: "Web", status: "operational" },
        ]}
      />
    );
    expect(screen.getByRole("status")).toHaveTextContent("Some systems are down");
    expect(screen.getByText("Outage")).toBeInTheDocument();
    expect(screen.getByText("Operational")).toBeInTheDocument();
  });
  it("explores history days with the keyboard and speaks them", async () => {
    const user = userEvent.setup();
    render(<StatusBadgeRow endDate="2026-09-30" services={[{ name: "API", status: "operational", uptime: 99.9, days: [...days] }]} />);
    const slider = screen.getByRole("slider", { name: "API history, 4 days" });
    slider.focus();
    expect(slider).toHaveAttribute("aria-valuetext", "Sep 30: Outage");
    await user.keyboard("{ArrowLeft}");
    expect(slider).toHaveAttribute("aria-valuetext", "Sep 29: Degraded performance, Slow");
    await user.keyboard("{Home}");
    expect(slider).toHaveAttribute("aria-valuenow", "0");
    await user.keyboard("{End}");
    expect(slider).toHaveAttribute("aria-valuenow", "3");
  });
  it("shows uptime with two decimals", () => {
    render(<StatusBadgeRow services={[{ name: "API", status: "operational", uptime: 99.9 }]} />);
    expect(screen.getByText("99.90% uptime")).toBeInTheDocument();
  });
});
