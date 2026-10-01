import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CircularProgress } from "@/components/ballmac/circular-progress";

describe("CircularProgress", () => {
  it("is a meter when it has one ring", () => {
    render(<CircularProgress rings={[{ label: "Storage", value: 72 }]} />);
    const meter = screen.getByRole("meter", { name: "Storage" });
    expect(meter).toHaveAttribute("aria-valuenow", "72");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
    expect(meter).toHaveAttribute("aria-valuetext", "Storage 72%");
  });
  it("is an image that lists every ring in its name", () => {
    render(
      <CircularProgress
        rings={[
          { label: "Move", value: 420, max: 560, display: "420 kcal" },
          { label: "Stand", value: 6, max: 12 },
        ]}
      />
    );
    expect(screen.getByRole("img", { name: "Progress rings: Move 420 kcal, Stand 50%" })).toBeInTheDocument();
  });
  it("repeats the values in a legend as text, and can hide it", () => {
    const rings = [{ label: "Move", value: 50 }];
    const { rerender } = render(<CircularProgress rings={rings} />);
    expect(screen.getByRole("list")).toHaveTextContent("Move50%");
    rerender(<CircularProgress rings={rings} legend={false} />);
    expect(screen.queryByRole("list")).toBeNull();
  });
  it("clamps values and shows custom center content", () => {
    render(
      <CircularProgress rings={[{ label: "Over", value: 250 }, { label: "Under", value: -4 }]}>
        <span>Center</span>
      </CircularProgress>
    );
    expect(screen.getByText("Center")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Progress rings: Over 100%, Under 0%" })).toBeInTheDocument();
  });
  it("opens a gauge at the bottom", () => {
    const { container } = render(<CircularProgress sweep={270} rings={[{ label: "Score", value: 50 }]} />);
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.style.transform).toBe("rotate(135deg)");
    const track = container.querySelector("circle.stroke-muted")!;
    const [on, total] = track.getAttribute("stroke-dasharray")!.split(" ").map(Number);
    expect(on! / total!).toBeCloseTo(0.75, 2);
  });
});
