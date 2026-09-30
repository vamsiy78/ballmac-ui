"use client";
import { CreditCard, Package } from "lucide-react";
import { buttonVariants } from "@/components/ballmac/button";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ballmac/drawer";
const lines = [
  ["Studio headphones", "1 × $129.00"],
  ["USB-C cable (2 m)", "2 × $14.00"],
  ["Carry case", "1 × $32.00"],
];
export default function DrawerDemo() {
  return (
    <div className="flex w-full max-w-sm items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
          <Package aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold">3 items</p>
          <p className="text-xs text-muted-foreground tabular-nums">$189.00</p>
        </div>
      </div>
      <Drawer>
        <DrawerTrigger className={buttonVariants()}>Review order</DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto flex w-full max-w-sm flex-col">
            <DrawerHeader>
              <DrawerTitle>Review your order</DrawerTitle>
              <DrawerDescription>Free shipping applied. Delivery by Friday.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
              <ul className="grid gap-2">
                {lines.map(([name, qty]) => (
                  <li key={name} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                    <span className="font-medium">{name}</span>
                    <span className="text-muted-foreground tabular-nums">{qty}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 flex justify-between text-sm font-semibold">
                <span>Total</span>
                <span className="tabular-nums">$189.00</span>
              </p>
            </DrawerBody>
            <DrawerFooter>
              <DrawerClose className={buttonVariants()}>
                <CreditCard aria-hidden="true" /> Pay $189.00
              </DrawerClose>
              <DrawerClose className={buttonVariants({ variant: "outline" })}>Keep shopping</DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
