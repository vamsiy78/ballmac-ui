import { Activity, Files, Users } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ballmac/tabs";
export default function TabsDemo() {
  return (
    <Tabs
      defaultValue="overview"
      className="w-full max-w-sm rounded-xl border bg-card p-4 shadow-sm"
    >
      <TabsList aria-label="Workspace views">
        <TabsTrigger value="overview">
          <Activity aria-hidden="true" className="size-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="files">
          <Files aria-hidden="true" className="size-4" />
          Files
        </TabsTrigger>
        <TabsTrigger value="team">
          <Users aria-hidden="true" className="size-4" />
          Team
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm font-semibold">Your workspace at a glance</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg border bg-background p-3">
            <p className="text-2xl font-semibold tabular-nums">24</p>
            <p className="text-xs text-muted-foreground">Active files</p>
          </div>
          <div className="rounded-lg border bg-background p-3">
            <p className="text-2xl font-semibold tabular-nums">8</p>
            <p className="text-xs text-muted-foreground">Teammates</p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="files">
        <p className="text-sm font-semibold">Recent files</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Product brief · Brand guide · Launch checklist
        </p>
      </TabsContent>
      <TabsContent value="team">
        <p className="text-sm font-semibold">People in this workspace</p>
        <p className="mt-2 text-sm text-muted-foreground">
          8 teammates can collaborate here.
        </p>
      </TabsContent>
    </Tabs>
  );
}
