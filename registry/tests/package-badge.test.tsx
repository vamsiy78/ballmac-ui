import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PackageBadge, formatBytes, formatCount } from "@/components/ballmac/package-badge";

describe("PackageBadge", () => {
  it("shows the facts it was given and copies the install command", async () => {
    const user = userEvent.setup();
    render(<PackageBadge name="@acme/ui" version="2.4.1" downloads={482300} size={18432} license="MIT" types formats={["ESM", "CJS"]} manager="pnpm" trend={[1, 2, 3]} />);
    expect(screen.getByText("v2.4.1")).toBeInTheDocument();
    expect(screen.getByText("482.3k")).toBeInTheDocument();
    expect(screen.getByText("18.0 kB")).toBeInTheDocument();
    expect(screen.getByText("Types included")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Weekly downloads over the last 3 weeks/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Copy install command: pnpm add @acme\/ui/ }));
    expect(await navigator.clipboard.readText()).toBe("pnpm add @acme/ui");
  });
  it("links the name and renders the compact pill", () => {
    render(<PackageBadge variant="inline" name="acme" version="1.0.0" downloads={12900} href="https://example.com/acme" />);
    expect(screen.getByRole("link", { name: "acme" })).toHaveAttribute("href", "https://example.com/acme");
    expect(screen.getByText("12.9k/wk")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });
  it("formats numbers", () => {
    expect(formatCount(999)).toBe("999");
    expect(formatCount(1_250_000)).toBe("1.3M");
    expect(formatBytes(512)).toBe("512 B");
  });
});
