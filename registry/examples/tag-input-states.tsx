import { TagInput } from "@/components/ballmac/tag-input"
export default function TagInputStates() {
  return (
    <div className="w-full max-w-sm">
      <p className="mb-2 text-sm font-medium">Add skills</p>
      <TagInput
        label="Skills"
        placeholder="Type a skill and press Enter"
        maxTags={3}
        maxLength={20}
      />
    </div>
  )
}
