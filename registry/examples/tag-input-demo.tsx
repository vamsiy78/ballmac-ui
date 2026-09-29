import { TagInput } from "@/components/ballmac/tag-input"
export default function TagInputDemo() {
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-5 shadow-sm">
      <p className="mb-1 text-sm font-semibold">Project labels</p>
      <p className="mb-4 text-xs text-muted-foreground">
        Keep related work easy to find.
      </p>
      <TagInput
        defaultValue={["Design", "Launch"]}
        label="Project labels"
        maxTags={5}
      />
    </div>
  )
}
