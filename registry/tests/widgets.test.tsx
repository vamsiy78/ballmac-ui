import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BatteryWidget, CalendarWidget, Widget, WeatherWidget } from "@/components/ballmac/widgets";

describe("Widget", () => {
  it("is a named section whose shape follows size", () => {
    const { rerender } = render(<Widget label="Mine" />);
    expect(screen.getByRole("region", { name: "Mine" }).className).toContain("aspect-square");
    rerender(<Widget label="Mine" size="medium" />);
    expect(screen.getByRole("region", { name: "Mine" }).className).toContain("aspect-[2.14/1]");
  });
});

describe("WeatherWidget", () => {
  const hourly = [{ label: "Now", temp: 72, condition: "clear" as const }];
  const daily = [
    { day: "Tue", low: 60, high: 78, condition: "clear" as const },
    { day: "Wed", low: 55, high: 70, condition: "rain" as const },
  ];
  it("gives a one-sentence summary and hides the visuals", () => {
    render(<WeatherWidget city="Cupertino" temperature={72} condition="partly-cloudy" high={78} low={61} />);
    const w = screen.getByRole("region", { name: "Weather in Cupertino" });
    expect(within(w).getByText(/Cupertino, 72 degrees, Partly Cloudy\. High 78, low 61\./)).toBeInTheDocument();
  });
  it("shows hourly on medium and daily on large", () => {
    const { container, rerender } = render(<WeatherWidget size="medium" city="X" temperature={1} high={2} low={0} hourly={hourly} daily={daily} />);
    expect(container.textContent).toContain("Now");
    expect(container.textContent).not.toContain("Wed");
    rerender(<WeatherWidget size="large" city="X" temperature={1} high={2} low={0} hourly={hourly} daily={daily} />);
    expect(container.textContent).toContain("Wed");
  });
  it("themes the surface by condition", () => {
    const { container } = render(<WeatherWidget city="X" temperature={1} condition="storm" high={2} low={0} />);
    expect(container.querySelector("[data-slot=widget-surface]")?.className).toContain("oklch(0.28_0.07_290)");
  });
});

describe("CalendarWidget", () => {
  const events = [{ id: "a", title: "Design review", time: "10:30 AM", tone: "red" as const }];
  it("reads the date in UTC and names the weekday", () => {
    render(<CalendarWidget date="2026-10-01" events={events} />);
    const w = screen.getByRole("region", { name: "Calendar, Thursday, October 1, 2026" });
    expect(within(w).getByText("Design review")).toBeInTheDocument();
  });
  it("circles today in the month grid on medium and says when there is nothing", () => {
    const { container, rerender } = render(<CalendarWidget size="medium" date="2026-10-01" />);
    expect(container.textContent).toContain("OCTOBER");
    expect(container.textContent).toContain("31");
    expect(container.querySelector(".bg-destructive.font-bold")?.textContent).toBe("1");
    rerender(<CalendarWidget date="2026-10-01" />);
    expect(screen.getByText("No events today")).toBeInTheDocument();
  });
});

describe("BatteryWidget", () => {
  const devices = [
    { id: "a", name: "iPhone", level: 82, charging: true, icon: <i /> },
    { id: "b", name: "Buds", level: 17, icon: <i /> },
  ];
  it("speaks each device with level and charging state", () => {
    render(<BatteryWidget devices={devices} />);
    expect(screen.getByText("iPhone, 82 percent, charging")).toBeInTheDocument();
    expect(screen.getByText("Buds, 17 percent")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
  it("lists devices with bars on the large size", () => {
    render(<BatteryWidget size="large" devices={devices} />);
    expect(screen.getByText("iPhone, 82 percent, charging")).toBeInTheDocument();
    expect(screen.getByText("82%")).toBeInTheDocument();
  });
});
