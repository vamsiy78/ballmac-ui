import { ScrollArea, ScrollBar } from "@/components/ballmac/scroll-area";
export default function ScrollAreaStates() {
  return (
    <div className="w-full max-w-xs">
      <p className="mb-2 text-sm font-medium">Project stages</p>
      <ScrollArea
        label="Project stages"
        type="always"
        className="w-full rounded-lg border"
      >
        <div className="flex w-max gap-2 p-3">
          {["Planning", "Design", "Build", "Review", "Launch"].map(
            (stage, index) => (
              <div
                key={stage}
                className="w-28 shrink-0 rounded-lg bg-muted p-3"
              >
                <p className="text-xs text-muted-foreground">0{index + 1}</p>
                <p className="mt-1 text-sm font-medium">{stage}</p>
              </div>
            ),
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
