import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ballmac/carousel";
const items = ["Design", "Build", "Review", "Launch", "Measure", "Learn"];
export default function CarouselStates() {
  return (
    <div className="grid w-full max-w-md gap-8">
      <Carousel label="Workflow steps" opts={{ align: "start" }} className="px-6">
        <CarouselContent>
          {items.map((t, i) => (
            <CarouselItem key={t} className="basis-1/2 sm:basis-1/3">
              <div className="flex aspect-square flex-col items-center justify-center rounded-xl border bg-card text-sm">
                <span className="text-2xl font-semibold tabular-nums">{i + 1}</span>
                {t}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-1 size-8" />
        <CarouselNext className="-right-1 size-8" />
      </Carousel>
      <Carousel label="Vertical tips" orientation="vertical" className="mx-auto w-56 py-2">
        <CarouselContent viewportClassName="h-28">
          {["Press ⌘K to search", "Drag to reorder", "Hold Shift to select a range"].map((t) => (
            <CarouselItem key={t} className="pt-2">
              <div className="flex h-24 items-center justify-center rounded-xl border bg-card px-4 text-center text-sm">{t}</div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-top-3 size-7" />
        <CarouselNext className="-bottom-3 size-7" />
      </Carousel>
    </div>
  );
}
