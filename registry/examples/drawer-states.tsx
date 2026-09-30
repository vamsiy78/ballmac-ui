"use client";
import { buttonVariants } from "@/components/ballmac/button";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ballmac/drawer";
const directions = ["left", "right", "top", "bottom"] as const;
export default function DrawerStates() {
  return (
    <div className="flex flex-wrap gap-2">
      {directions.map((direction) => (
        <Drawer key={direction} direction={direction}>
          <DrawerTrigger className={buttonVariants({ variant: "outline", size: "sm" })}>
            {direction[0].toUpperCase() + direction.slice(1)}
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Notifications</DrawerTitle>
              <DrawerDescription>Drag, swipe or press Escape to close.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
              <ul className="grid gap-2 text-sm">
                {["Ana commented on Launch plan", "Build #482 passed", "Kofi invited you to Pricing"].map((t) => (
                  <li key={t} className="rounded-lg border p-3">{t}</li>
                ))}
              </ul>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  );
}
