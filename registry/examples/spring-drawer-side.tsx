"use client"

import { buttonVariants } from "@/components/ballmac/button"
import {
  SpringDrawer,
  SpringDrawerBody,
  SpringDrawerContent,
  SpringDrawerDescription,
  SpringDrawerHeader,
  SpringDrawerTitle,
  SpringDrawerTrigger,
} from "@/components/ballmac/spring-drawer"

export default function SpringDrawerSide() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {(["left", "right"] as const).map((side) => (
        <SpringDrawer key={side} side={side}>
          <SpringDrawerTrigger className={buttonVariants({ variant: "outline" })}>From the {side}</SpringDrawerTrigger>
          <SpringDrawerContent>
            <SpringDrawerHeader className="pt-5">
              <SpringDrawerTitle>Notifications</SpringDrawerTitle>
              <SpringDrawerDescription>Drag the edge toward the screen edge to dismiss.</SpringDrawerDescription>
            </SpringDrawerHeader>
            <SpringDrawerBody>
              <p className="text-muted-foreground">You are all caught up. New activity will appear here.</p>
            </SpringDrawerBody>
          </SpringDrawerContent>
        </SpringDrawer>
      ))}
    </div>
  )
}
