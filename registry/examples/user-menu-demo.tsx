"use client";
import * as React from "react";
import { CreditCard, LifeBuoy, Settings, UserRound } from "lucide-react";
import { UserMenu, type UserMenuTheme } from "@/components/ballmac/user-menu";
export default function UserMenuDemo() {
  const [theme, setTheme] = React.useState<UserMenuTheme>("system");
  return (
    <div className="flex h-[26rem] w-full max-w-xs items-start justify-center">
      <UserMenu
        defaultOpen
        modal={false}
        variant="full"
        align="start"
        user={{ name: "Jordan Rivera", email: "jordan@acme.example", plan: "Pro", status: "online" }}
        groups={[
          [
            { label: "Profile", href: "#profile", icon: <UserRound />, shortcut: "⇧⌘P" },
            { label: "Billing", href: "#billing", icon: <CreditCard />, badge: "Due" },
            { label: "Settings", href: "#settings", icon: <Settings />, shortcut: "⌘," },
          ],
          [{ label: "Help and support", href: "#help", icon: <LifeBuoy /> }],
        ]}
        theme={theme}
        onThemeChange={setTheme}
        onSignOut={() => undefined}
      />
    </div>
  );
}
