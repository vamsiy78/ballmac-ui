import { FileText } from "lucide-react";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ballmac/item";
const files = [
  ["Brand guidelines.pdf", "4.2 MB · edited 2 hours ago"],
  ["Launch checklist.md", "12 KB · edited yesterday"],
  ["Pricing model.xlsx", "88 KB · edited Monday"],
];
export default function ItemStates() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <ItemGroup className="gap-0 rounded-xl border">
        {files.map(([name, meta], i) => (
          <div key={name}>
            {i > 0 && <ItemSeparator />}
            <Item size="sm">
              <ItemMedia>
                <FileText aria-hidden="true" className="size-4 text-muted-foreground" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{name}</ItemTitle>
                <ItemDescription className="line-clamp-1">{meta}</ItemDescription>
              </ItemContent>
            </Item>
          </div>
        ))}
      </ItemGroup>
      <Item variant="outline" size="sm">
        <ItemHeader>
          <ItemTitle>Storage</ItemTitle>
          <span className="text-xs text-muted-foreground tabular-nums">6.4 of 10 GB</span>
        </ItemHeader>
        <ItemContent>
          <ItemDescription>Upgrade to keep uploading past your limit.</ItemDescription>
        </ItemContent>
        <ItemFooter>
          <span className="text-xs text-muted-foreground">Resets monthly</span>
        </ItemFooter>
      </Item>
    </div>
  );
}
