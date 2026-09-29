"use client"

import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { Dialog as DialogPrimitive } from "radix-ui"
import * as React from "react"

import { DocsSidebar } from "@/components/site/docs-sidebar"
import type { NavGroup } from "@/lib/registry"

/** Phone and tablet navigation: a sheet with the main links and the full docs/components sidebar. */
export function MobileNav({ groups }: { groups: NavGroup[] }) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const [lastPath, setLastPath] = React.useState(pathname)
  // Close after navigating.
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        className="text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 inline-flex size-8 items-center justify-center rounded-md outline-none focus-visible:ring-[3px] md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-4" />
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <DialogPrimitive.Content className="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-80 flex-col border-r shadow-xl duration-200">
          <div className="flex h-14 items-center justify-between border-b px-4">
            <DialogPrimitive.Title className="text-sm font-semibold">Ballmac UI</DialogPrimitive.Title>
            <DialogPrimitive.Close className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md" aria-label="Close navigation">
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Description className="sr-only">Site navigation</DialogPrimitive.Description>
          <div className="flex-1 overflow-y-auto px-2 py-6">
            <DocsSidebar
              groups={[
                { title: "Ballmac UI", items: [{ href: "/", label: "Home" }, { href: "/pricing", label: "Pricing" }] },
                ...groups,
              ]}
            />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
