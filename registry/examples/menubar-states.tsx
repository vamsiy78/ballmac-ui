"use client";
import * as React from "react";
import {
  Menubar,
  MenubarContent,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ballmac/menubar";
export default function MenubarStates() {
  const [theme, setTheme] = React.useState("system");
  return (
    <div className="grid gap-3">
      <Menubar aria-label="Preferences menu">
        <MenubarMenu>
          <MenubarTrigger>Appearance</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Theme</MenubarLabel>
            <MenubarRadioGroup value={theme} onValueChange={setTheme}>
              <MenubarRadioItem value="light">Light</MenubarRadioItem>
              <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
              <MenubarRadioItem value="system">System</MenubarRadioItem>
            </MenubarRadioGroup>
            <MenubarSeparator />
            <MenubarLabel>Applies after reload</MenubarLabel>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Theme: {theme}
      </p>
    </div>
  );
}
