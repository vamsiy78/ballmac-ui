import {
  DescriptionList,
  DescriptionItem,
} from "@/components/ballmac/description-list"
export default function DescriptionListDemo() {
  return (
    <DescriptionList className="w-full max-w-sm">
      <DescriptionItem label="Workspace" value="Product design" />
      <DescriptionItem label="Owner" value="Alex Morgan" />
      <DescriptionItem label="Region" value="US East" />
      <DescriptionItem label="Created" value="September 12, 2026" />
    </DescriptionList>
  )
}
