import { Globe } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ballmac/select"

const regions = [
  { label: "North America", items: [["us-east", "US East (Virginia)"], ["us-west", "US West (Oregon)"], ["ca-central", "Canada (Montreal)"]] },
  { label: "Europe", items: [["eu-west", "Ireland"], ["eu-central", "Frankfurt"], ["eu-north", "Stockholm"]] },
  { label: "Asia Pacific", items: [["ap-south", "Mumbai"], ["ap-southeast", "Singapore"], ["ap-northeast", "Tokyo"]] },
] as const

export default function SelectGrouped() {
  return (
    <Select>
      <SelectTrigger className="w-full max-w-64" aria-label="Deployment region">
        <Globe />
        <SelectValue placeholder="Deployment region" />
      </SelectTrigger>
      <SelectContent>
        {regions.map((region, i) => (
          <SelectGroup key={region.label}>
            {i > 0 ? <SelectSeparator /> : null}
            <SelectLabel>{region.label}</SelectLabel>
            {region.items.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}
