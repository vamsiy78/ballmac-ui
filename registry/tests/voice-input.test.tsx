import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VoiceInput, formatClock } from "@/components/ballmac/voice-input";

describe("VoiceInput", () => {
  afterEach(() => vi.useRealTimers());

  it("button variant starts, then stops and uses the recording", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    const onStop = vi.fn();
    render(<VoiceInput onStart={onStart} onStop={onStop} />);
    const button = screen.getByRole("button", { name: "Start voice input" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    await user.click(button);
    expect(onStart).toHaveBeenCalledOnce();
    const stop = screen.getByRole("button", { name: "Stop and use recording" });
    expect(stop).toHaveAttribute("aria-pressed", "true");
    await user.click(stop);
    expect(onStop).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Transcribing…" })).toBeDisabled();
  });
  it("Escape discards while listening", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<VoiceInput state="listening" onCancel={onCancel} />);
    screen.getByRole("button", { name: "Stop and use recording" }).focus();
    await user.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledOnce();
  });
  it("bar variant shows discard, timer and send while listening", () => {
    vi.useFakeTimers();
    render(<VoiceInput variant="bar" state="listening" />);
    expect(screen.getByRole("button", { name: "Discard recording" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stop and use recording" })).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(4100); });
    expect(screen.getByText("0:04")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Listening");
  });
  it("bar variant shows the processing label", () => {
    render(<VoiceInput variant="bar" state="processing" processingLabel="Working…" />);
    expect(screen.getAllByText("Working…").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Discard recording" })).toBeDisabled();
  });
  it("formats the clock", () => {
    expect(formatClock(75)).toBe("1:15");
  });
});
