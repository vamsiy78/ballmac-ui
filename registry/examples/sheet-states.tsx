import { buttonVariants } from "@/components/ballmac/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ballmac/sheet";
const sides = ["left", "right", "top", "bottom"] as const;
export default function SheetStates() {
  return (
    <div className="flex flex-wrap gap-2">
      {sides.map((side) => (
        <Sheet key={side}>
          <SheetTrigger className={buttonVariants({ variant: "outline", size: "sm" })}>
            {side[0].toUpperCase() + side.slice(1)}
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>Activity</SheetTitle>
              <SheetDescription>Recent changes in this workspace.</SheetDescription>
            </SheetHeader>
            <SheetBody className="pb-5">
              <ul className="grid gap-3 text-sm">
                {["Ana renamed Launch plan", "Kofi uploaded 4 files", "Mei closed 3 tasks", "Sam invited two members"].map((t) => (
                  <li key={t} className="rounded-lg border p-3">{t}</li>
                ))}
              </ul>
            </SheetBody>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
}
