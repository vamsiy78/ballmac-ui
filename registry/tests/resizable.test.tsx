import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ballmac/resizable";

// jsdom has no layout, so sizes and drag distances are covered by the browser checks; here we verify semantics.
describe("Resizable", () => {
  it("exposes a focusable, labelled separator between two panels", () => {
    const { container } = render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50} minSize={20} id="a">A</ResizablePanel>
        <ResizableHandle label="Resize A" />
        <ResizablePanel defaultSize={50} id="b">B</ResizablePanel>
      </ResizablePanelGroup>,
    );
    const handle = screen.getByRole("separator", { name: "Resize A" });
    expect(handle).toHaveAttribute("tabindex", "0");
    expect(handle).toHaveAttribute("data-panel-group-direction", "horizontal");
    expect(container.querySelectorAll("[data-panel]")).toHaveLength(2);
  });
  it("supports vertical groups and a visible grip", () => {
    render(
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel id="a">A</ResizablePanel>
        <ResizableHandle label="Resize rows" withHandle />
        <ResizablePanel id="b">B</ResizablePanel>
      </ResizablePanelGroup>,
    );
    const handle = screen.getByRole("separator", { name: "Resize rows" });
    expect(handle).toHaveAttribute("data-panel-group-direction", "vertical");
    expect(handle.querySelector("svg")).toBeInTheDocument();
  });
});
