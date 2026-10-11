import type { Metadata } from "next"

import Link from "@/components/site/link"

import { CodePanel } from "@/components/site/code-panel"
import { DocsPage } from "@/components/site/docs-page"
import { FEELS } from "@ballmac-ui/theme-engine"

export const metadata: Metadata = {
  title: "Platform feels",
  description: "One switch makes every component handle like macOS, iOS or Windows: sizes, corners, focus ring, shadows, menus, sidebars and window chrome. For Tauri and Electron apps, and the web.",
  alternates: { canonical: "/docs/feels" },
}

const px = (v: string) => (v.startsWith("calc(var(--spacing) * ") ? `${Number.parseFloat(v.slice(22)) * 4} px` : v.endsWith("rem") ? `${Number.parseFloat(v) * 16} px` : v)

export default function FeelsPage() {
  return (
    <DocsPage
      title="Platform feels"
      lead="A feel is everything about a product except its colours: sizes, corners, focus, shadows, menus, sidebars, window controls and how it moves. Pick macOS, iOS, Windows or the neutral web feel and every component follows."
    >
      <p>
        Try them side by side in the <Link href="/themes#feels">theme builder</Link>. A feel works on top of any colour theme, so Ocean with the Windows feel is a valid combination.
      </p>
      <p>
        <strong>These are web components that feel like each platform, not native controls.</strong> Ballmac UI is not affiliated with Apple or Microsoft; the feels are original work informed by open-source design tokens and by measuring the platforms.
      </p>

      <h2 id="feels">The four feels</h2>
      <div className="not-prose my-4 overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[40rem] text-sm">
          <caption className="sr-only">What each platform feel sets</caption>
          <thead>
            <tr className="bg-muted/50 text-muted-foreground text-left text-xs">
              <th scope="col" className="px-3 py-2 font-medium">Feel</th>
              <th scope="col" className="px-3 py-2 font-medium">Controls</th>
              <th scope="col" className="px-3 py-2 font-medium">Corners</th>
              <th scope="col" className="px-3 py-2 font-medium">Focus ring</th>
              <th scope="col" className="px-3 py-2 font-medium">Window controls</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {FEELS.map((f) => (
              <tr key={f.slug}>
                <th scope="row" className="px-3 py-2 text-left align-top font-medium">
                  {f.title}
                  <span className="text-muted-foreground block text-xs font-normal">{f.tagline}</span>
                </th>
                <td className="px-3 py-2 align-top tabular-nums">{px(f.tokens.control.h)}</td>
                <td className="px-3 py-2 align-top tabular-nums">{Number((f.spec.radius * 16).toFixed(1))} px</td>
                <td className="px-3 py-2 align-top tabular-nums">
                  {f.tokens.focus.width}, {f.tokens.focus.alpha}
                </td>
                <td className="px-3 py-2 align-top">{f.controls === "left" ? "Left (traffic lights)" : f.controls === "right" ? "Right (caption buttons)" : "None"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul>
        {FEELS.map((f) => (
          <li key={f.slug}>
            <strong>{f.title}</strong>: {f.description} <code>@ballmac/feel-{f.slug}</code>
          </li>
        ))}
      </ul>

      <h2 id="install">Pick one feel</h2>
      <p>For an app that always runs on one platform, install its feel. It changes handling only and leaves your colours alone.</p>
      <CodePanel lang="bash" code={`npx shadcn@latest add @ballmac/feel-macos`} />

      <h2 id="auto">Or let the device pick</h2>
      <p>
        A Tauri or Electron app that ships to Mac and Windows, or a web app used on phones and desktops, should handle like the platform it is on.{" "}
        <code>feel-auto</code> includes all four feels and sets the right one before the first paint, so there is no flash.
      </p>
      <CodePanel lang="bash" code={`npx shadcn@latest add @ballmac/feel-auto`} />
      <CodePanel
        lang="tsx"
        title="app/layout.tsx"
        code={`import { FeelScript } from "@/components/ballmac/feel-script"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <FeelScript />
      </head>
      <body>{children}</body>
    </html>
  )
}`}
      />
      <p>Let people override it, and go back to the device&apos;s own feel with <code>auto</code>. The choice is remembered in the browser.</p>
      <CodePanel
        lang="tsx"
        code={`import { useFeel } from "@/lib/ballmac/feel"

const { feel, setFeel } = useFeel()
setFeel("windows")   // "web" | "macos" | "ios" | "windows"
setFeel("auto")      // the device's own feel`}
      />

      <h2 id="what-follows">What follows automatically</h2>
      <ul>
        <li>
          <strong>Shadows and text sizes.</strong> Tailwind&apos;s <code>shadow-xs</code> to <code>shadow-2xl</code> and <code>text-xs</code>, <code>text-sm</code>, <code>text-base</code> are rewritten, so every component and your own classes follow.
        </li>
        <li>
          <strong>Radius and density.</strong> The usual <code>--radius</code> and <code>--spacing</code>, set by the feel.
        </li>
        <li>
          <strong>The focus ring.</strong> One rule restyles every component that uses shadcn&apos;s standard <code>focus-visible:ring-[3px]</code>, which includes shadcn&apos;s own components. A few Ballmac items draw their own ring and keep it.
        </li>
        <li>
          <strong>Controls, menus and sidebars.</strong> Button, Input, Select and Tabs heights, menu rows and corners, sidebar rows (including the Windows accent pill), frosted popovers and sidebars, press dimming on iOS, scrollbars.
        </li>
        <li>
          <strong>Motion.</strong> Each feel brings a <Link href="/docs/motion">motion</Link> personality that suits it.
        </li>
      </ul>
      <p>Tokens are plain CSS variables, so you can change any of them:</p>
      <CodePanel
        lang="css"
        code={`:root {
  --bm-control-h: 2rem;          /* button and input height */
  --bm-focus-width: 2px;         /* focus ring */
  --bm-focus-alpha: 100%;
  --bm-shadow-sm: 0 1px 2px rgb(0 0 0 / .12);
  --bm-menu-item-h: 2rem;        /* menu rows */
  --bm-sidebar-item-h: 2.5rem;   /* sidebar rows */
  --bm-sidebar-indicator: 3px;   /* the accent pill on the selected row */
  --bm-material-blur: 30px;      /* frosted menus and sidebars */
  --bm-press-dim: 0.6;           /* opacity of a pressed button */
}`}
      />

      <h2 id="desktop">Desktop apps</h2>
      <p>
        <code>app-window</code> is the window chrome of a real app: a title bar that drags the window, maximizes on double-click, and carries the controls the platform draws. It has no Tauri or Electron dependency; you pass the actions in.
      </p>
      <CodePanel lang="bash" code={`npx shadcn@latest add @ballmac/app-window @ballmac/feel-auto`} />

      <h3 id="tauri">Tauri v2</h3>
      <p>Turn off the native frame, allow the window actions, and wire the buttons:</p>
      <CodePanel
        lang="json"
        title="src-tauri/tauri.conf.json"
        code={`{
  "app": {
    "windows": [{ "title": "Notes", "decorations": false }]
  }
}`}
      />
      <CodePanel
        lang="json"
        title="src-tauri/capabilities/default.json"
        code={`{
  "identifier": "default",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "core:window:allow-close",
    "core:window:allow-minimize",
    "core:window:allow-toggle-maximize",
    "core:window:allow-is-maximized",
    "core:window:allow-set-fullscreen",
    "core:window:allow-start-dragging"
  ]
}`}
      />
      <CodePanel
        lang="tsx"
        title="src/App.tsx"
        code={`import { getCurrentWindow } from "@tauri-apps/api/window"
import { AppWindow, AppWindowContent, AppWindowTitleBar } from "@/components/ballmac/app-window"

const win = getCurrentWindow()

export default function App() {
  const [maximized, setMaximized] = useState(false)
  useEffect(() => {
    win.isMaximized().then(setMaximized)
    const unlisten = win.onResized(() => win.isMaximized().then(setMaximized))
    return () => void unlisten.then((f) => f())
  }, [])

  return (
    <AppWindow
      className="h-screen rounded-none border-0"
      maximized={maximized}
      onClose={() => win.close()}
      onMinimize={() => win.minimize()}
      onMaximize={() => win.toggleMaximize()}
      onFullscreen={async () => win.setFullscreen(!(await win.isFullscreen()))}
    >
      <AppWindowTitleBar title="Notes" />
      <AppWindowContent>…</AppWindowContent>
    </AppWindow>
  )
}`}
      />

      <h3 id="electron">Electron</h3>
      <CodePanel
        lang="tsx"
        title="main.ts"
        code={`const win = new BrowserWindow({ frame: false, webPreferences: { preload: join(__dirname, "preload.js") } })

ipcMain.on("window", (event, action: "close" | "minimize" | "maximize") => {
  const w = BrowserWindow.fromWebContents(event.sender)
  if (!w) return
  if (action === "maximize") w.isMaximized() ? w.unmaximize() : w.maximize()
  else w[action]()
})`}
      />
      <CodePanel
        lang="tsx"
        title="preload.ts"
        code={`contextBridge.exposeInMainWorld("windowControls", {
  send: (action: "close" | "minimize" | "maximize") => ipcRenderer.send("window", action),
})`}
      />
      <CodePanel
        lang="tsx"
        title="renderer"
        code={`<AppWindow
  onClose={() => window.windowControls.send("close")}
  onMinimize={() => window.windowControls.send("minimize")}
  onMaximize={() => window.windowControls.send("maximize")}
/>`}
      />
      <p>
        The title bar sets both <code>data-tauri-drag-region</code> and <code>-webkit-app-region: drag</code>, and the toolbar inside it is marked no-drag, so buttons stay clickable.
      </p>
      <h3 id="limits">Know the limits</h3>
      <ul>
        <li>Windows 11&apos;s snap layouts (hovering the maximize button) belong to native caption buttons. If you need them, use Electron&apos;s <code>titleBarOverlay</code> and pass <code>controls={"{false}"}</code> to the title bar.</li>
        <li>On macOS, drawn traffic lights do not get the system&apos;s window-tiling menu. Keep the native frame (<code>titleBarStyle: &quot;hidden&quot;</code> in Electron) if you rely on it.</li>
        <li>
          Most of the <Link href="/components">Desktop collection</Link> is Mac-only by nature (Dock, Menu Bar, Spotlight, Launchpad, Dynamic Island, Control Center) and stays that way. <code>app-window</code>, the sidebar, menus and the form controls are the parts every platform shares.
        </li>
      </ul>

      <h2 id="links">Links</h2>
      <CodePanel
        lang="bash"
        code={`# open a feel in the builder
https://ui.ballmac.com/themes?fe=windows

# install a custom design with a feel, colours and motion together
npx shadcn@latest add "https://ui.ballmac.com/themes/custom.json?h=262&fe=macos"`}
      />
    </DocsPage>
  )
}
