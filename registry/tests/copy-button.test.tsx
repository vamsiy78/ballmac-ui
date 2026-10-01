import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyButton } from "@/components/ballmac/copy-button";

describe("CopyButton", () => {
  afterEach(() => vi.restoreAllMocks());

  it("copies the value, confirms, and announces politely", async () => {
    const user = userEvent.setup();
    const onCopied = vi.fn();
    render(<CopyButton value="pnpm add x" label="Copy" onCopied={onCopied} />);
    const button = screen.getByRole("button", { name: "Copy" });
    await user.click(button);
    expect(onCopied).toHaveBeenCalledWith("pnpm add x");
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Copied to clipboard");
    expect(await navigator.clipboard.readText()).toBe("pnpm add x");
  });
  it("works from the keyboard and reads text at click time with getValue", async () => {
    const user = userEvent.setup();
    let current = "first";
    render(<CopyButton getValue={async () => current} ariaLabel="Copy it" />);
    current = "second";
    await user.tab();
    await user.keyboard("{Enter}");
    expect(await navigator.clipboard.readText()).toBe("second");
  });
  it("reports failure when both clipboard routes fail", async () => {
    const user = userEvent.setup();
    const onError = vi.fn();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("blocked"));
    (document as unknown as { execCommand: () => boolean }).execCommand = () => false;
    render(<CopyButton value="x" onError={onError} />);
    await user.click(screen.getByRole("button", { name: "Copy to clipboard" }));
    expect(onError).toHaveBeenCalledOnce();
    expect(await screen.findByRole("button", { name: "Copy failed" })).toBeInTheDocument();
  });
});
