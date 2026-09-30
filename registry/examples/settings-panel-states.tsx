"use client";
import { SettingsPanel, SettingsRow, SettingsSection } from "@/components/ballmac/settings-panel";
import { Switch } from "@/components/ballmac/switch";
export default function SettingsPanelStates() {
  return (
    <SettingsPanel status="dirty" label="Privacy settings" className="max-w-lg">
      <SettingsSection title="Privacy" description="Control what others can see.">
        <SettingsRow label="Show activity status" description="Let teammates see when you are online." htmlFor="sps-a">
          <Switch id="sps-a" defaultChecked />
        </SettingsRow>
        <SettingsRow label="Searchable profile" htmlFor="sps-b">
          <Switch id="sps-b" />
        </SettingsRow>
      </SettingsSection>
    </SettingsPanel>
  );
}
