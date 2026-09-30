"use client";
import { Bell, Home, Search, User } from "lucide-react";
import { FloatingNav } from "@/components/ballmac/floating-nav";
const items = [
  { value: "home", label: "Home", icon: <Home /> },
  { value: "search", label: "Search", icon: <Search /> },
  { value: "alerts", label: "Alerts", icon: <Bell /> },
  { value: "me", label: "Profile", icon: <User /> },
];
export default function FloatingNavStates() {
  return (
    <div className="relative h-40 w-full max-w-sm overflow-hidden rounded-xl border bg-muted/40">
      <p className="p-4 text-sm text-muted-foreground">A bottom bar for mobile-style layouts. Labels collapse to icons on small screens.</p>
      <FloatingNav items={items} position="bottom" defaultValue="search" label="App" className="absolute" />
    </div>
  );
}
