import { EmptyState } from "@/components/ballmac/empty-state"
export default function EmptyStateDemo() {
  return (
    <EmptyState
      className="w-full max-w-md"
      title="Your workspace is ready"
      description="Create a project to keep tasks, files, and updates together."
      action={
        <a
          href="#new-project"
          className="bg-primary text-primary-foreground inline-flex h-9 items-center rounded-md px-4 text-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          Create project
        </a>
      }
      secondaryAction={
        <a
          href="#guide"
          className="text-muted-foreground hover:text-foreground rounded-sm text-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          Read the guide
        </a>
      }
    />
  )
}
