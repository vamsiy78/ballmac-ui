"use client"

import * as React from "react"
import { Cloud } from "lucide-react"

import { Desktop1, type Desktop1Values } from "@/components/ballmac/blocks/desktop-1/desktop-1"
import { Switch } from "@/components/ballmac/switch"

/** Inside a real native window: no frame, your own Sync pane, and the values held by the app. */
export default function Desktop1Custom() {
  const [values, setValues] = React.useState<Desktop1Values>({
    launchAtLogin: false,
    showInMenuBar: true,
    appearance: "dark",
    density: "compact",
    shortcut: "Mod+Alt+K",
    autoCheck: true,
    autoInstall: true,
    channel: "beta",
    crashReports: false,
  })
  const [sync, setSync] = React.useState(true)
  return (
    <div className="bg-card h-[28rem] w-full max-w-3xl overflow-hidden rounded-xl border">
      <Desktop1
        frame={false}
        appName="Acme"
        values={values}
        onValuesChange={setValues}
        defaultPane="sync"
        className="h-full"
        extraPanes={[
          {
            id: "sync",
            label: "Sync",
            icon: <Cloud />,
            content: (
              <div className="bg-card flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
                <div>
                  <p id="sync-label" className="text-sm">Sync across devices</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">Last synced a minute ago.</p>
                </div>
                <Switch checked={sync} onCheckedChange={setSync} aria-labelledby="sync-label" />
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
