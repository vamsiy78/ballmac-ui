"use client";
import { CalendarDays, FileText, Inbox, Search } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ballmac/sidebar";
const items = [
  { title: "Search", icon: Search },
  { title: "Inbox", icon: Inbox, active: true },
  { title: "Calendar", icon: CalendarDays },
  { title: "Docs", icon: FileText },
];
export default function SidebarStates() {
  return (
    <SidebarProvider defaultOpen={false} className="relative h-64 min-h-0 w-full max-w-md overflow-hidden rounded-xl border bg-muted/40">
      <Sidebar variant="floating" collapsible="icon" label="Quick navigation" className="absolute h-full">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map(({ title, icon: Icon, active }) => (
                  <SidebarMenuItem key={title}>
                    <SidebarMenuButton href={`#${title.toLowerCase()}`} isActive={active} tooltip={title}>
                      <Icon aria-hidden="true" />
                      <span>{title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="min-h-0 bg-transparent">
        <header className="flex h-12 items-center gap-2 px-3">
          <SidebarTrigger />
          <p className="text-sm font-medium">Icon rail, floating</p>
        </header>
        <p className="px-4 text-sm text-muted-foreground">Hover or focus an icon to see its name.</p>
      </SidebarInset>
    </SidebarProvider>
  );
}
