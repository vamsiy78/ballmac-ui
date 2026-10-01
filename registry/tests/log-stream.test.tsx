import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LogStream, clock, type LogLine } from "@/components/ballmac/log-stream";

const t = Date.UTC(2026, 8, 30, 14, 2, 11, 45);
const lines: LogLine[] = [
  { id: 1, time: t, level: "info", source: "api", message: "Server started" },
  { id: 2, time: t + 1000, level: "warn", message: "Slow query" },
  { id: 3, time: t + 2000, level: "error", message: "Connection refused" },
];

describe("LogStream", () => {
  it("renders a labelled log with UTC times and level words", () => {
    render(<LogStream lines={lines} title="Deploy" />);
    expect(screen.getByRole("log", { name: "Deploy, 3 lines" })).toHaveAttribute("aria-live", "off");
    expect(screen.getByText("14:02:11.045")).toBeInTheDocument();
    expect(screen.getAllByText("ERROR").length).toBeGreaterThan(0);
  });
  it("filters by level with toggle buttons and by search with highlighted matches", async () => {
    const user = userEvent.setup();
    render(<LogStream lines={lines} />);
    const warn = screen.getByRole("button", { name: /WARN/ });
    expect(warn).toHaveAttribute("aria-pressed", "true");
    await user.click(warn);
    expect(warn).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByText("Slow query")).toBeNull();
    await user.type(screen.getByRole("searchbox", { name: "Filter log lines" }), "refus");
    expect(screen.getByText("refus").tagName).toBe("MARK");
    expect(screen.queryByText("Server started")).toBeNull();
  });
  it("explains an empty filter result", async () => {
    const user = userEvent.setup();
    render(<LogStream lines={lines} />);
    await user.type(screen.getByRole("searchbox"), "nothing like this");
    expect(screen.getByText("No lines match the filters.")).toBeInTheDocument();
  });
  it("pauses the view, counts new lines and resumes with Jump", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<LogStream lines={lines} />);
    await user.click(screen.getByRole("button", { name: "Pause stream" }));
    expect(screen.getByText("Stream paused")).toBeInTheDocument();
    rerender(<LogStream lines={[...lines, { id: 4, time: t + 3000, level: "info", message: "Later line" }]} />);
    expect(screen.queryByText("Later line")).toBeNull();
    await user.click(screen.getByRole("button", { name: "1 new line" }));
    expect(screen.getByText("Later line")).toBeInTheDocument();
  });
  it("formats clock values and clears via the callback", async () => {
    expect(clock("nope")).toBe("--:--:--.---");
    const user = userEvent.setup();
    let cleared = 0;
    render(<LogStream lines={lines} onClear={() => cleared++} />);
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(cleared).toBe(1);
  });
});
