import {
  DescriptionList,
  DescriptionItem,
} from "@/components/ballmac/description-list"
export default function DescriptionListStates() {
  return (
    <DescriptionList layout="stacked" className="w-full max-w-sm">
      <DescriptionItem label="Deployment" value="Preview" />
      <DescriptionItem
        label="Commit"
        value={<code className="font-mono text-xs">a1b2c3d</code>}
      />
    </DescriptionList>
  )
}
