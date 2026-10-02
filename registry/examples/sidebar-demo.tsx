"use client";
import { BarChart3, ChevronsUpDown, FolderKanban, Home, Inbox, Settings, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ballmac/sidebar";
const main = [
  { title: "Home", icon: Home, active: true },
  { title: "Inbox", icon: Inbox, badge: "8" },
  { title: "Team", icon: Users },
  { title: "Reports", icon: BarChart3 },
];
export default function SidebarDemo() {
  return (
    <SidebarProvider className="relative h-80 min-h-0 w-full max-w-2xl overflow-hidden rounded-xl border bg-background shadow-sm">
      <Sidebar label="Workspace" className="absolute h-full">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip="Acme Inc." aria-label="Acme Inc. workspace">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">A</span>
                <span className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold">Acme Inc.</span>
                  <span className="truncate text-xs text-muted-foreground">Pro plan</span>
                </span>
                <ChevronsUpDown aria-hidden="true" className="ms-auto" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {main.map(({ title, icon: Icon, active, badge }) => (
                  <SidebarMenuItem key={title}>
                    <SidebarMenuButton href={`#${title.toLowerCase()}`} isActive={active} tooltip={title}>
                      <Icon aria-hidden="true" />
                      <span>{title}</span>
                    </SidebarMenuButton>
                    {badge && <SidebarMenuBadge>{badge}</SidebarMenuBadge>}
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton href="#projects" tooltip="Projects">
                    <FolderKanban aria-hidden="true" />
                    <span>Projects</span>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#launch">Launch plan</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#redesign">Site redesign</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="#settings" tooltip="Settings">
                <Settings aria-hidden="true" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="min-h-0 bg-transparent">
        <header className="flex h-12 items-center gap-2 border-b px-3">
          <SidebarTrigger />
          <p className="text-sm font-medium">Home</p>
        </header>
        <div className="grid flex-1 place-items-center p-4 text-center text-sm text-muted-foreground">
          Collapse with the button or press ⌘B (Ctrl+B).
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
