import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SourcesList } from "@/components/ballmac/sources-list";

const sources = Array.from({ length: 6 }, (_, i) => ({
  title: `Article ${i + 1}`,
  url: `https://example.com/${i + 1}`,
  site: `Site ${i + 1}`,
}));

describe("SourcesList", () => {
  it("toggles from its header button and reports the change", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<SourcesList sources={sources} onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole("button", { name: /Sources/ });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveTextContent("6 sources");
    await user.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("list", { name: "Sources" })).toBeInTheDocument();
  });
  it("shows a limited number, then all", async () => {
    const user = userEvent.setup();
    render(<SourcesList sources={sources} defaultOpen visibleCount={3} />);
    expect(screen.getAllByRole("link")).toHaveLength(3);
    await user.click(screen.getByRole("button", { name: "Show all 6" }));
    expect(screen.getAllByRole("link")).toHaveLength(6);
  });
  it("names each link with its number and gives rows stable ids", () => {
    render(<SourcesList sources={sources} collapsible={false} idPrefix="src" highlight={2} />);
    const link = screen.getByRole("link", { name: /Source 2: Article 2/ });
    expect(link).toHaveAttribute("id", "src-2");
    expect(link).toHaveAttribute("data-active", "true");
    expect(link).toHaveAttribute("href", "https://example.com/2");
  });
  it("stays open without a disclosure when collapsible is false", () => {
    render(<SourcesList sources={sources} collapsible={false} />);
    expect(screen.queryByRole("button", { name: /Sources/ })).toBeNull();
  });
});
