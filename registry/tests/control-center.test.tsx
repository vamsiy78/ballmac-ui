import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  ControlCenter,
  ControlCluster,
  ControlNowPlaying,
  ControlRow,
  ControlSlider,
  ControlTile,
} from "@/components/ballmac/control-center";

describe("ControlCenter", () => {
  it("is a named section of toggle buttons", async () => {
    const user = userEvent.setup();
    render(
      <ControlCenter>
        <ControlCluster>
          <ControlRow icon={<i />} label="Wi-Fi" status="Home" defaultPressed />
          <ControlRow icon={<i />} label="Bluetooth" />
        </ControlCluster>
        <ControlTile icon={<i />} label="Focus" />
      </ControlCenter>
    );
    expect(screen.getByRole("region", { name: "Control Center" })).toBeInTheDocument();
    const wifi = screen.getByRole("button", { name: /Wi-Fi/ });
    expect(wifi).toHaveAttribute("aria-pressed", "true");
    await user.click(wifi);
    expect(wifi).toHaveAttribute("aria-pressed", "false");
    await user.click(screen.getByRole("button", { name: /Focus/ }));
    expect(screen.getByRole("button", { name: /Focus/ })).toHaveAttribute("aria-pressed", "true");
  });
  it("supports controlled tiles", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    render(<ControlTile icon={<i />} label="Airplane" pressed={false} onPressedChange={onPressedChange} />);
    await user.click(screen.getByRole("button", { name: "Airplane" }));
    expect(onPressedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button", { name: "Airplane" })).toHaveAttribute("aria-pressed", "false");
  });
  it("sliders are named and move with the keyboard", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ControlSlider label="Display" defaultValue={50} onValueChange={onValueChange} />);
    const slider = screen.getByRole("slider", { name: "Display" });
    expect(slider).toHaveAttribute("aria-valuenow", "50");
    slider.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(onValueChange).toHaveBeenLastCalledWith(52);
    await user.keyboard("{End}");
    expect(onValueChange).toHaveBeenLastCalledWith(100);
  });
  it("now playing toggles and reports track changes", async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    const onPlayingChange = vi.fn();
    render(<ControlNowPlaying title="Song" artist="Band" onNext={onNext} onPlayingChange={onPlayingChange} />);
    expect(screen.getByText("Song")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Play" }));
    expect(onPlayingChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next track" }));
    expect(onNext).toHaveBeenCalled();
  });
});
