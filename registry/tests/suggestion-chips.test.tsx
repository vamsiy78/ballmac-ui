import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SuggestionChips } from "@/components/ballmac/suggestion-chips";

const suggestions = [
  { label: "Explain this", prompt: "Explain this error in detail" },
  { label: "Summarize", description: "Three bullets" },
];

describe("SuggestionChips", () => {
  it("sends the prompt, falling back to the label, with the keyboard", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<SuggestionChips suggestions={suggestions} onSelect={onSelect} />);
    await user.tab();
    expect(screen.getByRole("button", { name: "Explain this" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenLastCalledWith("Explain this error in detail", suggestions[0]);
    await user.tab();
    await user.keyboard(" ");
    expect(onSelect).toHaveBeenLastCalledWith("Summarize", suggestions[1]);
  });
  it("is a named group and renders card descriptions", () => {
    render(<SuggestionChips variant="cards" label="Ways to start" suggestions={suggestions} />);
    expect(screen.getByRole("group", { name: "Ways to start" })).toBeInTheDocument();
    expect(screen.getByText("Three bullets")).toBeInTheDocument();
  });
  it("disables chips and shows placeholders while loading", () => {
    const { rerender } = render(<SuggestionChips suggestions={suggestions} disabled />);
    expect(screen.getByRole("button", { name: "Summarize" })).toBeDisabled();
    rerender(<SuggestionChips suggestions={suggestions} loading />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByRole("group")).toHaveAttribute("aria-busy", "true");
  });
  it("calls onRefresh from a labelled button", async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();
    render(<SuggestionChips suggestions={suggestions} onRefresh={onRefresh} />);
    await user.click(screen.getByRole("button", { name: "Show other suggestions" }));
    expect(onRefresh).toHaveBeenCalledOnce();
  });
});
