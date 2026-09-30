import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { TableOfContents } from "@/components/ballmac/table-of-contents";

describe("TableOfContents", () => {
  it("renders explicit items as a labelled navigation and marks the current one", async () => {
    render(
      <>
        <TableOfContents items={[{ id: "a", title: "Intro" }, { id: "b", title: "Setup", level: 3 }]} title="In this guide" />
        <h2 id="a">Intro</h2>
        <h3 id="b">Setup</h3>
      </>,
    );
    expect(screen.getByRole("navigation", { name: "In this guide" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("link", { name: "Intro" })).toHaveAttribute("aria-current", "location"));
  });
  it("collects headings automatically, creating ids, and scrolls on click", async () => {
    const user = userEvent.setup();
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
    function Page() {
      const ref = React.useRef<HTMLElement>(null);
      return (
        <>
          <article ref={ref}>
            <h2>Getting started</h2>
            <h3>Install it</h3>
            <h4>Ignored</h4>
          </article>
          <TableOfContents headingsFrom={ref} />
        </>
      );
    }
    render(<Page />);
    const link = await screen.findByRole("link", { name: "Install it" });
    expect(link).toHaveAttribute("href", "#install-it");
    expect(screen.queryByRole("link", { name: "Ignored" })).not.toBeInTheDocument();
    await user.click(link);
    expect(window.scrollTo).toHaveBeenCalled();
    expect(window.location.hash).toBe("#install-it");
  });
});
