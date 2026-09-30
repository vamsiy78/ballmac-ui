import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// jsdom has no layout, so ResponsiveContainer would render nothing; render its children directly.
vi.mock("recharts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("recharts")>()),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
import { ChartContainer, ChartLegendContent, ChartTooltipContent, type ChartConfig } from "@/components/ballmac/chart";

const config = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  refunds: { label: "Refunds", theme: { light: "red", dark: "orange" } },
} satisfies ChartConfig;

describe("Chart", () => {
  it("names the figure, links the summary and emits series color variables", () => {
    const { container } = render(
      <ChartContainer config={config} label="Revenue by month" summary="Revenue rose each month.">
        <div />
      </ChartContainer>,
    );
    const figure = screen.getByRole("figure", { name: "Revenue by month" });
    expect(figure).toHaveAccessibleDescription("Revenue rose each month.");
    const css = container.querySelector("style")?.innerHTML ?? "";
    expect(css).toContain("--color-revenue: var(--chart-1)");
    expect(css).toContain("--color-refunds: red");
    expect(css).toContain(".dark [data-chart=");
  });
  it("renders tooltip rows with configured labels and formatted values", () => {
    const { container } = render(
      <ChartContainer config={config} label="Tooltip host">
        <ChartTooltipContent
          active
          label="Sep"
          payload={[{ dataKey: "revenue", name: "revenue", value: 34600, color: "red", payload: { fill: "red" } }]}
        />
      </ChartContainer>,
    );
    expect(container.textContent).toContain("Revenue");
    expect(container.textContent).toContain("34,600");
  });
  it("renders a legend from the payload", () => {
    render(
      <ChartContainer config={config} label="Legend host">
        <ChartLegendContent payload={[{ value: "revenue", dataKey: "revenue", color: "red" }]} />
      </ChartContainer>,
    );
    expect(screen.getByRole("listitem")).toHaveTextContent("Revenue");
  });
});
