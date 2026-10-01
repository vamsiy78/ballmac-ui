"use client"

import { Button } from "@/components/ballmac/button"
import {
  SpringDrawer,
  SpringDrawerBody,
  SpringDrawerClose,
  SpringDrawerContent,
  SpringDrawerDescription,
  SpringDrawerFooter,
  SpringDrawerHeader,
  SpringDrawerTitle,
  SpringDrawerTrigger,
} from "@/components/ballmac/spring-drawer"
import { buttonVariants } from "@/components/ballmac/button"

const rows = ["Espresso beans, 1 kg", "Oat milk, 6 pack", "Ceramic dripper", "Paper filters, 100", "Gift card", "Shipping"]

export default function SpringDrawerDemo() {
  return (
    <SpringDrawer snapPoints={[0.4, 0.7, 0.95]} defaultSnap={0}>
      <SpringDrawerTrigger className={buttonVariants({ variant: "outline" })}>Open cart</SpringDrawerTrigger>
      <SpringDrawerContent>
        <SpringDrawerHeader>
          <SpringDrawerTitle>Your cart</SpringDrawerTitle>
          <SpringDrawerDescription>Drag the handle, or use the arrow keys on it, to change the height.</SpringDrawerDescription>
        </SpringDrawerHeader>
        <SpringDrawerBody>
          <ul className="divide-y">
            {rows.map((r, i) => (
              <li key={r} className="flex items-center justify-between py-3">
                <span>{r}</span>
                <span className="font-mono text-xs text-muted-foreground tabular-nums">${(12 + i * 7).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </SpringDrawerBody>
        <SpringDrawerFooter>
          <SpringDrawerClose className={buttonVariants({ variant: "ghost" })}>Keep shopping</SpringDrawerClose>
          <Button>Checkout</Button>
        </SpringDrawerFooter>
      </SpringDrawerContent>
    </SpringDrawer>
  )
}
