import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChatAttachment, ChatAttachmentList, attachmentKind, formatFileSize } from "@/components/ballmac/chat-attachment";

describe("ChatAttachment", () => {
  it("shows type and size, and removes by keyboard", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <ChatAttachmentList>
        <ChatAttachment name="report.pdf" size={2_516_582} type="application/pdf" onRemove={onRemove} />
      </ChatAttachmentList>
    );
    expect(screen.getByRole("list", { name: "Attachments" })).toBeInTheDocument();
    expect(screen.getByText("PDF · 2.4 MB")).toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole("button", { name: "Remove report.pdf" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onRemove).toHaveBeenCalledOnce();
  });
  it("shows upload progress as a progressbar", () => {
    render(<ChatAttachment name="data.csv" status="uploading" progress={40} />);
    const bar = screen.getByRole("progressbar", { name: "Uploading data.csv" });
    expect(bar).toHaveAttribute("aria-valuenow", "40");
    expect(screen.getByText("Uploading 40%")).toBeInTheDocument();
  });
  it("explains a failure and retries", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ChatAttachment name="big.zip" status="error" error="File is too large" onRetry={onRetry} />);
    expect(screen.getByText("File is too large")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry uploading big.zip" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
  it("opens from a button without nesting the remove button inside it", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ChatAttachment name="photo.png" previewUrl="blob:x" type="image/png" onOpen={onOpen} onRemove={() => {}} variant="tile" />);
    const open = screen.getByRole("button", { name: "Open photo.png" });
    expect(open.querySelector("button")).toBeNull();
    await user.click(open);
    expect(onOpen).toHaveBeenCalledOnce();
  });
  it("detects kinds and formats sizes", () => {
    expect(attachmentKind("a.tsx")).toBe("code");
    expect(attachmentKind("x", "image/webp")).toBe("image");
    expect(attachmentKind("mystery")).toBe("file");
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(88_400_000)).toBe("84 MB");
  });
});
