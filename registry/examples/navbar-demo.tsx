"use client";
import * as React from "react";
import { Hexagon } from "lucide-react";
import { buttonVariants } from "@/components/ballmac/button";
import {
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarLink,
  NavbarLinks,
  NavbarMobileLink,
  NavbarMobileMenu,
} from "@/components/ballmac/navbar";
const links = [
  ["Product", "#product"],
  ["Pricing", "#pricing"],
  ["Docs", "#docs"],
  ["Changelog", "#changelog"],
] as const;
export default function NavbarDemo() {
  const scroller = React.useRef<HTMLDivElement>(null);
  return (
    <div ref={scroller} className="h-80 w-full max-w-3xl overflow-auto rounded-xl border bg-background shadow-sm">
      <Navbar scrollContainer={scroller} containerClassName="max-w-none">
        <NavbarBrand href="#top">
          <Hexagon aria-hidden="true" className="size-5 text-primary" /> Acme
        </NavbarBrand>
        <NavbarLinks className="ml-4">
          {links.map(([label, href]) => (
            <NavbarLink key={label} href={href} active={label === "Pricing"}>
              {label}
            </NavbarLink>
          ))}
        </NavbarLinks>
        <NavbarActions className="max-md:hidden">
          <a href="#signin" className={buttonVariants({ variant: "ghost", size: "sm" })}>Sign in</a>
          <a href="#start" className={buttonVariants({ size: "sm" })}>Get started</a>
        </NavbarActions>
        <NavbarMobileMenu label="Menu">
          {links.map(([label, href]) => (
            <NavbarMobileLink key={label} href={href} active={label === "Pricing"}>
              {label}
            </NavbarMobileLink>
          ))}
          <a href="#start" className={buttonVariants({ className: "mt-3" })}>Get started</a>
        </NavbarMobileMenu>
      </Navbar>
      <div className="grid gap-4 p-6">
        <h2 className="text-2xl font-semibold tracking-tight">Simple pricing for growing teams</h2>
        <p className="max-w-prose text-sm text-muted-foreground">Scroll this panel: the header gains a border and a soft shadow once content moves under it.</p>
        {["Starter", "Team", "Scale"].map((plan) => (
          <div key={plan} className="rounded-xl border p-5">
            <p className="font-medium">{plan}</p>
            <p className="text-sm text-muted-foreground">Everything you need to ship together, with support when you want it.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
