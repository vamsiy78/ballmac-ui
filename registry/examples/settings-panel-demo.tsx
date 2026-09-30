"use client";
import * as React from "react";
import { SettingsPanel, SettingsRow, SettingsSection, type SettingsStatus } from "@/components/ballmac/settings-panel";
import { Switch } from "@/components/ballmac/switch";
const defaults = { name: "Acme Inc.", digest: true, mentions: true, frequency: "daily" };
export default function SettingsPanelDemo() {
  const [saved, setSaved] = React.useState(defaults);
  const [values, setValues] = React.useState(defaults);
  const [status, setStatus] = React.useState<SettingsStatus>("idle");
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  const shown: SettingsStatus = status === "saving" || status === "saved" ? status : dirty ? "dirty" : "idle";
  const set = (patch: Partial<typeof defaults>) => {
    setStatus("idle");
    setValues((v) => ({ ...v, ...patch }));
  };
  return (
    <SettingsPanel
      status={shown}
      className="max-w-3xl"
      label="Workspace settings"
      onDiscard={() => setValues(saved)}
      onSave={() => {
        setStatus("saving");
        setTimeout(() => {
          setSaved(values);
          setStatus("saved");
          setTimeout(() => setStatus("idle"), 1800);
        }, 900);
      }}
    >
      <SettingsSection title="General" description="How your workspace appears to everyone.">
        <SettingsRow label="Workspace name" htmlFor="sp-name" stacked>
          <input
            id="sp-name"
            value={values.name}
            onChange={(e) => set({ name: e.target.value })}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
          />
        </SettingsRow>
      </SettingsSection>
      <SettingsSection title="Notifications" description="Choose what reaches your inbox.">
        <SettingsRow label="Weekly digest" description="A summary of activity every Monday." htmlFor="sp-digest">
          <Switch id="sp-digest" checked={values.digest} onCheckedChange={(v) => set({ digest: v })} />
        </SettingsRow>
        <SettingsRow label="Mentions" description="Email me when someone mentions me." htmlFor="sp-mentions">
          <Switch id="sp-mentions" checked={values.mentions} onCheckedChange={(v) => set({ mentions: v })} />
        </SettingsRow>
        <SettingsRow label="Frequency" description="How often to group emails." htmlFor="sp-frequency">
          <select
            id="sp-frequency"
            value={values.frequency}
            onChange={(e) => set({ frequency: e.target.value })}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
          >
            <option value="instant">Instantly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </SettingsRow>
      </SettingsSection>
    </SettingsPanel>
  );
}
