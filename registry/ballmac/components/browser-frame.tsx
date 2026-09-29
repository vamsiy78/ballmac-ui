// Ballmac UI: Browser Frame. https://ui.ballmac.com/components/browser-frame
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Copy, Globe, Lock, PanelLeft, Plus, RotateCw, Share, X } from "lucide-react"

import { cn } from "@/lib/utils"

type BrowserFrameTab = {
  /** Tab title. */
  title: string
  /** Optional favicon; defaults to a globe icon. */
  icon?: React.ReactNode
}

type BrowserFrameProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Page content. Ignored when `src` is set. */
  children?: React.ReactNode
  /** Address shown in the URL field. Safari shows just the domain, so a short value reads best. */
  url?: string
  /** Show the padlock before the address. */
  secure?: boolean
  /** Tabs shown in a strip under the toolbar. Omit for a single-tab window. */
  tabs?: (string | BrowserFrameTab)[]
  /** Index of the selected tab. */
  activeTab?: number
  /** Screenshot shown as the page, cropped to fill it. */
  src?: string
  /** Alternative text for `src`. */
  alt?: string
  /**
   * Width in CSS pixels that the page is laid out at; it is then scaled to fit, like a desktop
   * window shown small. Needs a fixed height, so it implies `aspectRatio` 16/10 unless you set one.
   */
  screenWidth?: number
  /** Aspect ratio of the page area, e.g. 16 / 10. Omit to let the content set the height. */
  aspectRatio?: number
  /** Class names for the page area. */
  screenClassName?: string
}

/** Lays screen content out at `screenWidth` CSS pixels and scales it to fit, without re-rendering. */
function useScreenScale(screenWidth: number | undefined) {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const screen = ref.current
    if (!screen || !screenWidth) return
    const measure = () => screen.style.setProperty("--screen-scale", String(screen.clientWidth / screenWidth))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(screen)
    return () => observer.disconnect()
  }, [screenWidth])
  return ref
}

const toolbarIcon = "size-4 shrink-0 text-muted-foreground"

function TrafficLights() {
  return (
    <div aria-hidden="true" data-slot="browser-frame-traffic-lights" className="flex shrink-0 items-center gap-2">
      {["bg-(--traffic-close)", "bg-(--traffic-minimize)", "bg-(--traffic-zoom)"].map((color) => (
        <span key={color} className={cn("size-3 rounded-full shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.18)]", color)} />
      ))}
    </div>
  )
}

function BrowserFrame({
  url = "acme.com",
  secure = true,
  tabs,
  activeTab = 0,
  src,
  alt = "",
  screenWidth,
  aspectRatio,
  screenClassName,
  className,
  style,
  children,
  ...props
}: BrowserFrameProps) {
  const scaled = !src && !!screenWidth
  const screenRef = useScreenScale(scaled ? screenWidth : undefined)
  const ratio = aspectRatio ?? (scaled || src ? 16 / 10 : undefined)
  const tabList = tabs?.map((tab) => (typeof tab === "string" ? { title: tab } : tab))

  return (
    <div
      data-slot="browser-frame"
      className={cn(
        "@container relative flex w-full min-w-0 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-[0_1px_2px_rgb(0_0_0/0.06),0_24px_60px_-24px_rgb(0_0_0/0.35)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.04),0_24px_60px_-24px_rgb(0_0_0/0.8)]",
        "[--traffic-close:oklch(0.69_0.2_25)] [--traffic-minimize:oklch(0.83_0.16_82)] [--traffic-zoom:oklch(0.74_0.19_145)]",
        className
      )}
      style={style}
      {...props}
    >
      {/* Toolbar */}
      <div
        data-slot="browser-frame-toolbar"
        className="flex h-11 shrink-0 items-center gap-3 border-b bg-muted/50 px-3.5 @md:gap-4"
      >
        <TrafficLights />
        <div aria-hidden="true" className="hidden items-center gap-3 @lg:flex">
          <PanelLeft className={toolbarIcon} />
          <ChevronLeft className={toolbarIcon} />
          <ChevronRight className={cn(toolbarIcon, "opacity-40")} />
        </div>
        <div
          data-slot="browser-frame-address"
          className="mx-auto flex h-7 w-full max-w-sm min-w-0 items-center justify-center gap-1.5 rounded-md bg-background/80 px-2.5 text-xs text-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--foreground)_8%,transparent)]"
        >
          {secure && <Lock aria-label="Secure connection" className="size-3 shrink-0 text-muted-foreground" />}
          <span className="truncate">{url}</span>
          <RotateCw aria-hidden="true" className="ml-auto hidden size-3 shrink-0 text-muted-foreground @sm:block" />
        </div>
        <div aria-hidden="true" className="hidden items-center gap-3 @lg:flex">
          <Share className={toolbarIcon} />
          <Plus className={toolbarIcon} />
          <Copy className={toolbarIcon} />
        </div>
      </div>

      {/* Tab strip */}
      {tabList && tabList.length > 0 && (
        <div
          data-slot="browser-frame-tabs"
          role="presentation"
          className="flex h-9 shrink-0 items-stretch gap-px border-b bg-muted/70 p-1"
        >
          {tabList.map((tab, i) => {
            const active = i === activeTab
            return (
              <div
                key={i}
                data-slot="browser-frame-tab"
                data-state={active ? "active" : "inactive"}
                className={cn(
                  "relative flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md px-2 text-[11px]",
                  active
                    ? "bg-background font-medium text-foreground shadow-[0_0_0_1px_color-mix(in_oklch,var(--foreground)_7%,transparent),0_1px_2px_rgb(0_0_0/0.06)]"
                    : "text-muted-foreground",
                  // Hide extra tabs on narrow frames, but always keep the selected one.
                  !active && i > 1 && "hidden @md:flex"
                )}
              >
                {active && <X aria-hidden="true" className="absolute left-2 size-3 text-muted-foreground" />}
                <span aria-hidden="true" className="flex size-3.5 shrink-0 items-center justify-center [&_svg]:size-3.5">
                  {tab.icon ?? <Globe />}
                </span>
                <span className="truncate">{tab.title}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Page */}
      <div
        ref={screenRef}
        data-slot="browser-frame-screen"
        className={cn("relative min-h-0 flex-1 overflow-hidden bg-background text-foreground", screenClassName)}
        style={ratio ? { aspectRatio: ratio } : undefined}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img data-slot="browser-frame-image" className="absolute inset-0 size-full object-cover object-top" src={src} alt={alt} />
        ) : scaled ? (
          <div
            data-slot="browser-frame-viewport"
            className="absolute top-0 left-0 origin-top-left"
            style={{
              width: screenWidth,
              height: "calc(100% / var(--screen-scale, 1))",
              transform: "scale(var(--screen-scale, 1))",
            }}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

export { BrowserFrame, type BrowserFrameProps, type BrowserFrameTab }
