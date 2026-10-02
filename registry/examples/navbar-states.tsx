"use client";
import * as React from "react";
import { Hexagon } from "lucide-react";
import { Navbar, NavbarBrand, NavbarLink, NavbarLinks } from "@/components/ballmac/navbar";
export default function NavbarStates() {
  const scroller = React.useRef<HTMLDivElement>(null);
  return (
    <div ref={scroller} className="h-64 w-full max-w-md overflow-auto rounded-xl border bg-background">
      <Navbar hideOnScroll border="always" scrollContainer={scroller} containerClassName="max-w-none">
        <NavbarBrand href="#top">
          <Hexagon aria-hidden="true" className="size-5 text-primary" /> Acme
        </NavbarBrand>
        <NavbarLinks className="ms-auto">
          <NavbarLink href="#a" active>Overview</NavbarLink>
          <NavbarLink href="#b">Guides</NavbarLink>
        </NavbarLinks>
      </Navbar>
      <div className="grid gap-3 p-5 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Hides while you scroll down, returns when you scroll up.</p>
        {Array.from({ length: 10 }, (_, i) => (
          <p key={i} className="rounded-lg border p-3">Paragraph {i + 1}: long pages keep the content in view and bring navigation back on demand.</p>
        ))}
      </div>
    </div>
  );
}
