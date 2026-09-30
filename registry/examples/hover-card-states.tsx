import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ballmac/hover-card";
export default function HoverCardStates() {
  return (
    <div className="w-full max-w-xs text-sm">
      <p className="text-muted-foreground">
        Reviewed by{" "}
        <HoverCard openDelay={100}>
          <HoverCardTrigger
            href="#reviewer"
            className="font-medium text-foreground underline decoration-border underline-offset-4"
          >
            Morgan Lee
          </HoverCardTrigger>
          <HoverCardContent align="start">
            <p className="font-semibold">Morgan Lee</p>
            <p className="mt-1 text-muted-foreground">
              Product designer · Working on workspace sharing and navigation.
            </p>
          </HoverCardContent>
        </HoverCard>{" "}
        before publication.
      </p>
    </div>
  );
}
