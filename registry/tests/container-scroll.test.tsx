import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContainerScroll } from "@/components/ballmac/container-scroll";

describe("ContainerScroll", () => {
  it("renders the title and keeps children as real content inside the frame", () => {
    render(
      <ContainerScroll title={<h2>Product tour</h2>}>
        <button type="button">Try it</button>
      </ContainerScroll>,
    );
    expect(screen.getByRole("heading", { name: "Product tour" })).toBeInTheDocument();
    const frame = document.querySelector("[data-slot=container-scroll-frame]")!;
    expect(frame).toContainElement(screen.getByRole("button", { name: "Try it" }));
  });
});
