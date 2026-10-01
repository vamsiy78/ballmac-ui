import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { VideoDialog } from "@/components/ballmac/video-dialog";

describe("VideoDialog", () => {
  it("reads as a play button with the title and length", () => {
    render(<VideoDialog title="Product tour" youtubeId="abc123" duration="3:12" />);
    expect(screen.getByRole("button", { name: /Play video: Product tour/ })).toBeInTheDocument();
    expect(screen.getByText("3:12")).toBeInTheDocument();
  });
  it("loads nothing until it is opened", () => {
    const { container } = render(<VideoDialog title="Tour" youtubeId="abc123" />);
    expect(container.querySelector("iframe")).toBeNull();
    expect(document.querySelector("iframe")).toBeNull();
  });
  it("embeds a YouTube video from the privacy domain when opened, and removes it when closed", async () => {
    const user = userEvent.setup();
    render(<VideoDialog title="Tour" youtubeId="abc123" />);
    await user.click(screen.getByRole("button", { name: /Play video/ }));
    const dialog = await screen.findByRole("dialog", { name: "Tour" });
    const frame = dialog.querySelector("iframe")!;
    expect(frame).toHaveAttribute("title", "Tour");
    expect(frame.getAttribute("src")).toContain("https://www.youtube-nocookie.com/embed/abc123");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(document.querySelector("iframe")).toBeNull());
    expect(screen.getByRole("button", { name: /Play video/ })).toHaveFocus();
  });
  it("plays a video file with controls", async () => {
    const user = userEvent.setup();
    render(<VideoDialog title="Clip" src="/clip.mp4" thumbnail="/poster.png" />);
    await user.click(screen.getByRole("button", { name: /Play video: Clip/ }));
    const dialog = await screen.findByRole("dialog");
    const video = dialog.querySelector("video")!;
    expect(video).toHaveAttribute("src", "/clip.mp4");
    expect(video).toHaveAttribute("controls");
  });
  it("closes with its labelled button and reports the change", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<VideoDialog title="Tour" embedUrl="https://player.example.com/v/1" onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole("button", { name: /Play video/ }));
    await user.click(await screen.findByRole("button", { name: "Close video" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});
