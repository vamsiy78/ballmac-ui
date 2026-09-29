// Ballmac UI: Animated Tabs. https://ui.ballmac.com/components/animated-tabs
"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { duration, ease, spring } from "@/lib/ballmac/motion"

type AnimatedTabsVariant = "pill" | "underline"

type AnimatedTabsContextValue = { value: string; indicatorId: string; variant: AnimatedTabsVariant }

const AnimatedTabsContext = React.createContext<AnimatedTabsContextValue | null>(null)

function useAnimatedTabs(part: string) {
  const context = React.useContext(AnimatedTabsContext)
  if (!context) throw new Error(`<${part}> must be used inside <AnimatedTabs>`)
  return context
}

type AnimatedTabsProps = React.ComponentProps<typeof TabsPrimitive.Root> & {
  /** Indicator style: a sliding pill behind the label, or a sliding underline. */
  variant?: AnimatedTabsVariant
}

function AnimatedTabs({
  variant = "pill",
  value: valueProp,
  defaultValue = "",
  onValueChange,
  className,
  ...props
}: AnimatedTabsProps) {
  const [internal, setInternal] = React.useState(defaultValue)
  const value = valueProp ?? internal
  const indicatorId = `animated-tabs-${React.useId()}`
  const context = React.useMemo(() => ({ value, indicatorId, variant }), [value, indicatorId, variant])

  return (
    <AnimatedTabsContext.Provider value={context}>
      <TabsPrimitive.Root
        data-slot="animated-tabs"
        data-variant={variant}
        value={value}
        onValueChange={(next) => {
          if (valueProp === undefined) setInternal(next)
          onValueChange?.(next)
        }}
        className={cn("flex flex-col gap-4", className)}
        {...props}
      />
    </AnimatedTabsContext.Provider>
  )
}

function AnimatedTabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  const { variant } = useAnimatedTabs("AnimatedTabsList")
  return (
    <TabsPrimitive.List
      data-slot="animated-tabs-list"
      className={cn(
        "relative inline-flex w-fit max-w-full items-center overflow-x-auto [scrollbar-width:none]",
        variant === "pill" ? "h-10 gap-0.5 rounded-full bg-muted p-1" : "h-10 gap-5 border-b",
        className
      )}
      {...props}
    />
  )
}

function AnimatedTabsTrigger({
  value,
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { value: selected, indicatorId, variant } = useAnimatedTabs("AnimatedTabsTrigger")
  const reduceMotion = useReducedMotion()
  const active = selected === value

  return (
    <TabsPrimitive.Trigger
      data-slot="animated-tabs-trigger"
      value={value}
      className={cn(
        "relative inline-flex h-full shrink-0 items-center justify-center gap-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground outline-none transition-colors duration-150 select-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        variant === "pill" ? "rounded-full px-3.5" : "rounded-sm px-0.5",
        className
      )}
      {...props}
    >
      {active && (
        <motion.span
          aria-hidden="true"
          data-slot="animated-tabs-indicator"
          layoutId={indicatorId}
          transition={reduceMotion ? { duration: 0 } : spring.snappy}
          className={cn(
            "pointer-events-none absolute",
            variant === "pill"
              ? "inset-0 rounded-full bg-background shadow-[0_1px_2px_rgb(0_0_0/0.08),0_0_0_1px_color-mix(in_oklch,var(--foreground)_6%,transparent)] dark:bg-accent"
              : "inset-x-0 bottom-0 h-0.5 rounded-full bg-foreground"
          )}
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-1.5">{children}</span>
    </TabsPrimitive.Trigger>
  )
}

function AnimatedTabsContent({ className, children, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  const reduceMotion = useReducedMotion()
  return (
    <TabsPrimitive.Content
      data-slot="animated-tabs-content"
      className={cn("outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 rounded-md", className)}
      {...props}
    >
      {/* Radix mounts only the selected panel, so each panel fades in as it arrives. */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 6, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: duration.slow, ease: ease.out }}
      >
        {children}
      </motion.div>
    </TabsPrimitive.Content>
  )
}

export {
  AnimatedTabs,
  AnimatedTabsList,
  AnimatedTabsTrigger,
  AnimatedTabsContent,
  type AnimatedTabsProps,
  type AnimatedTabsVariant,
}
