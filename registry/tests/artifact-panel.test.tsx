import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ArtifactPanel } from "@/components/ballmac/artifact-panel";

describe("ArtifactPanel", () => {
  it("switches between preview and code with the arrow keys", async () => {
    const user = userEvent.setup();
    render(
      <ArtifactPanel title="Counter" code="const a = 1" filename="a.ts">
        <p>Rendered result</p>
      </ArtifactPanel>
    );
    expect(screen.getByRole("region", { name: "Counter" })).toBeInTheDocument();
    expect(screen.getByText("Rendered result")).toBeInTheDocument();
    screen.getByRole("tab", { name: "Preview" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Code" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("const a = 1")).toBeInTheDocument();
  });
  it("steps through versions and reports them", async () => {
    const user = userEvent.setup();
    const onVersionChange = vi.fn();
    render(
      <ArtifactPanel title="Doc" code="x" versions={3} onVersionChange={onVersionChange}>
        <p>p</p>
      </ArtifactPanel>
    );
    const group = screen.getByRole("group", { name: "Versions" });
    expect(group).toHaveTextContent("v3");
    expect(screen.getByRole("button", { name: "Next version" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Previous version" }));
    expect(onVersionChange).toHaveBeenCalledWith(2);
    expect(group).toHaveTextContent("v2");
  });
  it("copies the code and confirms", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    render(<ArtifactPanel title="T" code="hello" onCopy={onCopy}><p>p</p></ArtifactPanel>);
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(onCopy).toHaveBeenCalledOnce();
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
  });
  it("disables copy and download while streaming and closes", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ArtifactPanel title="T" code="partial" filename="f.txt" streaming onClose={onClose}><p>p</p></ArtifactPanel>);
    expect(screen.getByRole("region", { name: "T" })).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Copy code" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Download f.txt" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Close artifact" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
