"use client";
import * as React from "react";
import { Bell, FileText, Folder, Home, Moon, Palette, Settings, Sun, Monitor, UserPlus } from "lucide-react";
import { CommandBar, type CommandBarGroup } from "@/components/ballmac/command-bar";
export default function CommandBarDemo() {
  const [last, setLast] = React.useState("Nothing yet");
  const run = (name: string) => () => setLast(name);
  const groups: CommandBarGroup[] = [
    {
      heading: "Go to",
      items: [
        { id: "home", label: "Home", icon: <Home />, shortcut: ["G", "H"], onSelect: run("Opened Home") },
        { id: "projects", label: "Projects", icon: <Folder />, shortcut: ["G", "P"], onSelect: run("Opened Projects") },
        { id: "docs", label: "Documents", icon: <FileText />, keywords: ["files", "notes"], onSelect: run("Opened Documents") },
      ],
    },
    {
      heading: "Actions",
      items: [
        {
          id: "theme",
          label: "Change theme…",
          icon: <Palette />,
          keywords: ["dark", "light", "appearance"],
          pages: [
            {
              heading: "Theme",
              items: [
                { id: "light", label: "Light", icon: <Sun />, onSelect: run("Theme: light") },
                { id: "dark", label: "Dark", icon: <Moon />, onSelect: run("Theme: dark") },
                { id: "system", label: "System", icon: <Monitor />, onSelect: run("Theme: system") },
              ],
            },
          ],
        },
        { id: "invite", label: "Invite teammate", icon: <UserPlus />, description: "Send an invitation by email", onSelect: run("Invite sent") },
        { id: "notifications", label: "Notification settings", icon: <Bell />, onSelect: run("Opened notifications") },
        { id: "settings", label: "Settings", icon: <Settings />, shortcut: ["⌘", ","], onSelect: run("Opened Settings") },
      ],
    },
  ];
  return (
    <div className="grid w-full max-w-sm gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <CommandBar groups={groups} />
      <p className="text-xs text-muted-foreground" aria-live="polite">
        Last command: <span className="font-medium text-foreground">{last}</span>
      </p>
    </div>
  );
}
