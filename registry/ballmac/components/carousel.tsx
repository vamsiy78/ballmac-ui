// Ballmac UI: Carousel. https://ui.ballmac.com/components/carousel
// Based on shadcn/ui Carousel (MIT, Copyright (c) 2023 shadcn) on Embla Carousel (MIT, Copyright (c) 2019 David Jerleke), adding slide labels, dot pagination, autoplay with a pause control, and reduced-motion handling.
"use client";

import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type CarouselApi = UseEmblaCarouselType[1];
type CarouselOptions = NonNullable<Parameters<typeof useEmblaCarousel>[0]>;

type CarouselContextValue = {
  viewportRef: UseEmblaCarouselType[0];
  api: CarouselApi;
  orientation: "horizontal" | "vertical";
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  selectedIndex: number;
  count: number;
  playing: boolean;
  autoplay: boolean;
  setPlaying: (playing: boolean) => void;
};
const CarouselContext = React.createContext<CarouselContextValue | null>(null);
const SlideContext = React.createContext<{ index: number; count: number } | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error("useCarousel must be used within <Carousel>");
  return context;
}

type CarouselProps = Omit<React.ComponentProps<"div">, "children"> & {
  children?: React.ReactNode;
  /** Embla options, for example `{ loop: true, align: "start" }`. */
  opts?: CarouselOptions;
  /** Direction of travel. */
  orientation?: "horizontal" | "vertical";
  /** Receives the Embla API once it is ready, for custom controls. */
  setApi?: (api: NonNullable<CarouselApi>) => void;
  /** Advance on a timer, in milliseconds (`true` = 5000). Pauses on hover and focus, and never runs under reduced motion. Pair it with `CarouselPlayPause`. */
  autoplay?: boolean | number;
  /** Accessible name of the carousel region. */
  label?: string;
};

/** A swipeable, keyboard-operable slider of slides. Compose with CarouselContent, CarouselItem and the controls. */
function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  autoplay = false,
  label = "Carousel",
  className,
  children,
  onKeyDownCapture,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...props
}: CarouselProps) {
  const reduce = useReducedMotion();
  const [viewportRef, api] = useEmblaCarousel(
    { ...opts, axis: orientation === "horizontal" ? "x" : "y", ...(reduce ? { duration: 0 } : {}) },
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [userPlaying, setUserPlaying] = React.useState(true);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    if (!api) return;
    const update = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
      setSelectedIndex(api.selectedScrollSnap());
      setCount(api.scrollSnapList().length);
    };
    update();
    api.on("select", update).on("reInit", update);
    setApi?.(api);
    return () => {
      api.off("select", update).off("reInit", update);
    };
  }, [api, setApi]);

  const autoplayMs = autoplay === true ? 5000 : autoplay || 0;
  const running = !!autoplayMs && !reduce && userPlaying && !hovered && !focused;
  React.useEffect(() => {
    if (!api || !running) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      if (api.canScrollNext()) api.scrollNext();
      else api.scrollTo(0);
    }, autoplayMs);
    return () => window.clearInterval(id);
  }, [api, running, autoplayMs]);

  const value: CarouselContextValue = {
    viewportRef,
    api,
    orientation,
    scrollPrev: () => api?.scrollPrev(),
    scrollNext: () => api?.scrollNext(),
    scrollTo: (i) => api?.scrollTo(i),
    canScrollPrev,
    canScrollNext,
    selectedIndex,
    count,
    playing: !!autoplayMs && !reduce && userPlaying,
    autoplay: !!autoplayMs && !reduce,
    setPlaying: setUserPlaying,
  };

  return (
    <CarouselContext.Provider value={value}>
      <div
        data-slot="carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        className={cn("relative min-w-0", className)}
        onKeyDownCapture={(event) => {
          onKeyDownCapture?.(event);
          if (event.defaultPrevented) return;
          const target = event.target as HTMLElement;
          if (target.closest("input, textarea, select, [contenteditable=true]")) return;
          const prev = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
          const next = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
          if (event.key === prev) {
            event.preventDefault();
            api?.scrollPrev();
          } else if (event.key === next) {
            event.preventDefault();
            api?.scrollNext();
          }
        }}
        onMouseEnter={(e) => {
          onMouseEnter?.(e);
          setHovered(true);
        }}
        onMouseLeave={(e) => {
          onMouseLeave?.(e);
          setHovered(false);
        }}
        onFocus={(e) => {
          onFocus?.(e);
          setFocused(true);
        }}
        onBlur={(e) => {
          onBlur?.(e);
          setFocused(false);
        }}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

type CarouselContentProps = React.ComponentProps<"div"> & {
  /** Classes for the clipping viewport around the track. */
  viewportClassName?: string;
};
function CarouselContent({ className, viewportClassName, children, ...props }: CarouselContentProps) {
  const { viewportRef, orientation, autoplay, playing } = useCarousel();
  const slides = React.Children.toArray(children);
  return (
    <div
      ref={viewportRef}
      data-slot="carousel-viewport"
      className={cn("overflow-hidden", viewportClassName)}
    >
      <div
        data-slot="carousel-content"
        aria-live={autoplay && playing ? "off" : "polite"}
        className={cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className)}
        {...props}
      >
        {slides.map((child, index) => (
          <SlideContext.Provider key={index} value={{ index, count: slides.length }}>
            {child}
          </SlideContext.Provider>
        ))}
      </div>
    </div>
  );
}

type CarouselItemProps = React.ComponentProps<"div">;
function CarouselItem({ className, ...props }: CarouselItemProps) {
  const { orientation } = useCarousel();
  const slide = React.useContext(SlideContext);
  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={slide ? `${slide.index + 1} of ${slide.count}` : undefined}
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className,
      )}
      {...props}
    />
  );
}

const controlClass =
  "inline-flex size-9 items-center justify-center rounded-full border bg-background/90 text-foreground shadow-sm outline-none backdrop-blur transition-[background-color,opacity,box-shadow] hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4";

type CarouselPreviousProps = React.ComponentProps<"button">;
function CarouselPrevious({ className, ...props }: CarouselPreviousProps) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();
  return (
    <button
      type="button"
      data-slot="carousel-previous"
      aria-label="Previous slide"
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      className={cn(
        controlClass,
        "absolute z-10",
        orientation === "horizontal"
          ? "top-1/2 left-3 -translate-y-1/2"
          : "top-3 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      {...props}
    >
      <ArrowLeft aria-hidden="true" />
    </button>
  );
}

type CarouselNextProps = React.ComponentProps<"button">;
function CarouselNext({ className, ...props }: CarouselNextProps) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  return (
    <button
      type="button"
      data-slot="carousel-next"
      aria-label="Next slide"
      disabled={!canScrollNext}
      onClick={scrollNext}
      className={cn(
        controlClass,
        "absolute z-10",
        orientation === "horizontal"
          ? "top-1/2 right-3 -translate-y-1/2"
          : "bottom-3 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      {...props}
    >
      <ArrowRight aria-hidden="true" />
    </button>
  );
}

type CarouselDotsProps = React.ComponentProps<"div">;
/** Pagination dots. The active dot stretches into a pill. Each dot is a labelled button. */
function CarouselDots({ className, ...props }: CarouselDotsProps) {
  const { count, selectedIndex, scrollTo } = useCarousel();
  if (count < 2) return null;
  return (
    <div
      data-slot="carousel-dots"
      role="group"
      aria-label="Choose slide"
      className={cn("flex items-center justify-center gap-1", className)}
      {...props}
    >
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === selectedIndex ? "true" : undefined}
          onClick={() => scrollTo(i)}
          className="group/dot inline-flex h-6 min-w-6 items-center justify-center rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span
            className={cn(
              "block h-1.5 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none",
              i === selectedIndex
                ? "w-5 bg-primary"
                : "w-1.5 bg-muted-foreground/40 group-hover/dot:bg-muted-foreground/70",
            )}
          />
        </button>
      ))}
    </div>
  );
}

type CarouselPlayPauseProps = React.ComponentProps<"button">;
/** Pause and resume autoplay. Renders nothing when `autoplay` is off or reduced motion is on. */
function CarouselPlayPause({ className, ...props }: CarouselPlayPauseProps) {
  const { autoplay, playing, setPlaying } = useCarousel();
  if (!autoplay) return null;
  return (
    <button
      type="button"
      data-slot="carousel-play-pause"
      aria-label={playing ? "Pause autoplay" : "Start autoplay"}
      onClick={() => setPlaying(!playing)}
      className={cn(controlClass, "size-8", className)}
      {...props}
    >
      {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
    </button>
  );
}

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  CarouselPlayPause,
  useCarousel,
  type CarouselApi,
  type CarouselProps,
  type CarouselContentProps,
  type CarouselItemProps,
  type CarouselPreviousProps,
  type CarouselNextProps,
  type CarouselDotsProps,
  type CarouselPlayPauseProps,
};
