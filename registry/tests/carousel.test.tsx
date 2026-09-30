import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPlayPause, CarouselPrevious } from "@/components/ballmac/carousel";

function setup(props: Partial<React.ComponentProps<typeof Carousel>> = {}) {
  return render(
    <Carousel label="Highlights" {...props}>
      <CarouselContent>
        {["One", "Two", "Three"].map((t) => (
          <CarouselItem key={t}>{t}</CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots />
      <CarouselPlayPause />
    </Carousel>,
  );
}

describe("Carousel", () => {
  it("exposes carousel and slide semantics with position labels", () => {
    setup();
    expect(screen.getByRole("region", { name: "Highlights" })).toHaveAttribute("aria-roledescription", "carousel");
    const slides = screen.getAllByRole("group", { name: /of 3/ });
    expect(slides.map((s) => s.getAttribute("aria-label"))).toEqual(["1 of 3", "2 of 3", "3 of 3"]);
    expect(slides[0]).toHaveAttribute("aria-roledescription", "slide");
  });
  it("has labelled controls that render without autoplay", () => {
    setup();
    expect(screen.getByRole("button", { name: "Previous slide" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next slide" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /autoplay/i })).not.toBeInTheDocument();
  });
  it("pauses and resumes autoplay with its control", async () => {
    const user = userEvent.setup();
    setup({ autoplay: 4000 });
    const pause = screen.getByRole("button", { name: "Pause autoplay" });
    await act(async () => {});
    await user.click(pause);
    expect(screen.getByRole("button", { name: "Start autoplay" })).toBeInTheDocument();
  });
});
