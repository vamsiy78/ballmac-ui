import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Citation, hostOf } from "@/components/ballmac/citation";

const a = { title: "Sea ice extent", url: "https://www.example.org/ice", snippet: "Measured daily.", site: "Polar Center" };
const b = { title: "Arctic minimum", url: "https://example.com/min", snippet: "Second lowest." };

describe("Citation", () => {
  it("is a link named with its number and title", () => {
    render(<Citation index={2} sources={a} />);
    const link = screen.getByRole("link", { name: "Source 2: Sea ice extent" });
    expect(link).toHaveAttribute("href", a.url);
    expect(link).toHaveAttribute("target", "_blank");
  });
  it("opens a preview card on keyboard focus", async () => {
    const user = userEvent.setup();
    render(<Citation sources={a} />);
    await user.tab();
    expect(await screen.findByText("Measured daily.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open source/ })).toHaveAttribute("href", a.url);
  });
  it("pages through several sources", async () => {
    const user = userEvent.setup();
    render(<Citation variant="pill" sources={[a, b]} />);
    const pill = screen.getByRole("link", { name: "Source: Polar Center and 1 more" });
    expect(pill).toHaveTextContent("+1");
    await user.tab();
    expect(await screen.findByText("Source 1 of 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous source" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Next source" }));
    expect(screen.getByText("Source 2 of 2")).toBeInTheDocument();
    expect(screen.getByText("Second lowest.")).toBeInTheDocument();
  });
  it("derives a host name", () => {
    expect(hostOf("https://www.example.org/a/b")).toBe("example.org");
    expect(hostOf("not a url")).toBe("not a url");
  });
});
