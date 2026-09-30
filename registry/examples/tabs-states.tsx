import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ballmac/tabs";
export default function TabsStates() {
  return (
    <Tabs defaultValue="activity" className="w-full max-w-sm">
      <TabsList variant="underline" aria-label="Project details">
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent
        value="activity"
        className="pt-2 text-sm text-muted-foreground"
      >
        Your latest project updates appear here.
      </TabsContent>
      <TabsContent
        value="details"
        className="pt-2 text-sm text-muted-foreground"
      >
        Shared project information and files.
      </TabsContent>
      <TabsContent
        value="settings"
        className="pt-2 text-sm text-muted-foreground"
      >
        Manage access and notifications.
      </TabsContent>
    </Tabs>
  );
}
