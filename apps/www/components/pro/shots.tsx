import Image from "next/image"

import { cn } from "@/lib/utils"

/** A quiet window frame, the same one the block cards use, around a screenshot. */
export function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-background overflow-hidden rounded-xl border shadow-[0_28px_70px_-32px_rgb(0_0_0/0.4)]", className)}>
      <div className="bg-muted/50 flex h-7 items-center gap-1.5 border-b px-3" aria-hidden="true">
        <span className="bg-foreground/15 size-2 rounded-full" />
        <span className="bg-foreground/15 size-2 rounded-full" />
        <span className="bg-foreground/15 size-2 rounded-full" />
      </div>
      {children}
    </div>
  )
}

/** A picture that exists in a light and a dark version (`<base>.light.webp`, `<base>.dark.webp`). Only the one that matches the theme is downloaded. */
export function Themed({ base, alt, width, height, priority = false, className }: { base: string; alt: string; width: number; height: number; priority?: boolean; className?: string }) {
  return (
    <>
      {(["light", "dark"] as const).map((mode) => (
        <Image
          key={mode}
          src={`${base}.${mode}.webp`}
          alt={alt}
          width={width}
          height={height}
          unoptimized
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          className={cn("h-auto w-full", mode === "light" ? "dark:hidden" : "hidden dark:block", className)}
        />
      ))}
    </>
  )
}
