import { SearchField } from "@/components/ballmac/search-field"
export default function SearchFieldStates() {
  return (
    <div className="w-full max-w-sm">
      <p className="mb-2 text-sm font-medium">Find a team member</p>
      <SearchField label="Find a team member" placeholder="Name or email" />
    </div>
  )
}
