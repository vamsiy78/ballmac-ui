import { BellRing, ChevronRight, Github, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ballmac/badge";
import { buttonVariants } from "@/components/ballmac/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
  itemVariants,
} from "@/components/ballmac/item";
export default function ItemDemo() {
  return (
    <ItemGroup className="w-full max-w-md">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <ShieldCheck aria-hidden="true" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            Two-factor authentication <Badge status="success">On</Badge>
          </ItemTitle>
          <ItemDescription>
            Codes from your authenticator app protect sign-in.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <button type="button" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Manage
          </button>
        </ItemActions>
      </Item>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <BellRing aria-hidden="true" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Deploy alerts</ItemTitle>
          <ItemDescription>Email when a production deploy fails.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <button type="button" className={buttonVariants({ size: "sm" })}>
            Enable
          </button>
        </ItemActions>
      </Item>
      <a href="#connections" className={itemVariants({ variant: "muted" })}>
        <ItemMedia variant="icon">
          <Github aria-hidden="true" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Connected accounts</ItemTitle>
          <ItemDescription>1 connected: GitHub</ItemDescription>
        </ItemContent>
        <ItemActions>
          <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground" />
        </ItemActions>
      </a>
    </ItemGroup>
  );
}
