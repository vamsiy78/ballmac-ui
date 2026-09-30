import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SectionTabs } from "@/components/ballmac/section-tabs";

describe("SectionTabs", () => {
  it("renders real links in a labelled navigation and marks the current section", async () => {
    render(
      <>
        <SectionTabs label="Page sections" sections={[{ id: "s1", label: "Overview" }, { id: "s2", label: "Pricing" }]} />
        <section id="s1" />
        <section id="s2" />
      </>,
    );
    expect(screen.getByRole("navigation", { name: "Page sections" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "#s2");
    await waitFor(() => expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "location"));
  });
  it("scrolls to the section and updates the hash when a tab is chosen", async () => {
    const user = userEvent.setup();
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
    render(
      <>
        <SectionTabs sections={[{ id: "s1", label: "Overview" }, { id: "s2", label: "Pricing" }]} />
        <section id="s1" />
        <section id="s2" />
      </>,
    );
    await user.click(screen.getByRole("link", { name: "Pricing" }));
    expect(window.scrollTo).toHaveBeenCalled();
    expect(window.location.hash).toBe("#s2");
  });
});
