import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Toolbar, ToolbarButton, ToolbarSearch, ToolbarSegment, ToolbarSegmented } from "@/components/ballmac/toolbar";

describe("Toolbar", () => {
  it("is a labelled toolbar with title and subtitle", () => {
    render(<Toolbar label="Docs" title="Documents" subtitle="3 items"><ToolbarButton aria-label="Share" /></Toolbar>);
    expect(screen.getByRole("toolbar", { name: "Docs" })).toBeInTheDocument();
    expect(screen.getByText("Documents")).toBeInTheDocument();
    expect(screen.getByText("3 items")).toBeInTheDocument();
  });
  it("moves between buttons with arrow keys (one tab stop)", async () => {
    const user = userEvent.setup();
    render(
      <Toolbar label="Actions">
        <ToolbarButton aria-label="One" />
        <ToolbarButton aria-label="Two" />
        <ToolbarButton aria-label="Three" />
      </Toolbar>
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "One" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Two" })).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
  });
  it("shows a label on labeled buttons and reflects pressed", () => {
    render(<Toolbar label="A"><ToolbarButton labeled pressed>Bold</ToolbarButton></Toolbar>);
    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true");
  });
  it("selects segments", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Toolbar label="A">
        <ToolbarSegmented type="single" defaultValue="a" onValueChange={onValueChange} aria-label="View">
          <ToolbarSegment value="a">A</ToolbarSegment>
          <ToolbarSegment value="b">B</ToolbarSegment>
        </ToolbarSegmented>
      </Toolbar>
    );
    await user.click(screen.getByRole("radio", { name: "B" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
  });
  it("search clears through its button", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<Toolbar label="A"><ToolbarSearch value="abc" onChange={() => {}} onClear={onClear} /></Toolbar>);
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(onClear).toHaveBeenCalled();
  });
});
