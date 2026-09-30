import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SettingsPanel, SettingsRow, SettingsSection } from "@/components/ballmac/settings-panel";

function setup(props: Partial<React.ComponentProps<typeof SettingsPanel>> = {}) {
  return render(
    <SettingsPanel label="Preferences" {...props}>
      <SettingsSection title="Notifications" description="Choose what you get.">
        <SettingsRow label="Weekly digest" description="Every Monday." htmlFor="digest">
          <input id="digest" type="checkbox" />
        </SettingsRow>
      </SettingsSection>
    </SettingsPanel>,
  );
}

describe("SettingsPanel", () => {
  it("labels the form and sections and links rows to their controls", () => {
    setup();
    expect(screen.getByRole("form", { name: "Preferences" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Notifications" })).toBeInTheDocument();
    expect(screen.getByLabelText("Weekly digest")).toBe(document.getElementById("digest"));
    expect(screen.queryByRole("button", { name: "Save changes" })).not.toBeInTheDocument();
  });
  it("shows the save bar when dirty and saves or discards", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onDiscard = vi.fn();
    setup({ status: "dirty", onSave, onDiscard });
    expect(screen.getByRole("status")).toHaveTextContent("You have unsaved changes");
    await user.click(screen.getByRole("button", { name: "Discard" }));
    expect(onDiscard).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(onSave).toHaveBeenCalledOnce();
  });
  it("disables actions while saving and announces the result", () => {
    const { rerender } = setup({ status: "saving" });
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Saving");
    rerender(
      <SettingsPanel label="Preferences" status="saved">
        <div />
      </SettingsPanel>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Changes saved");
  });
});
