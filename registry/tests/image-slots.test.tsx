import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero1 } from "@/components/ballmac/blocks/hero-1/hero-1";
import { Blog1 } from "@/components/ballmac/blocks/blog-1/blog-1";
import { BlogPost1 } from "@/components/ballmac/blocks/blog-post-1/blog-post-1";

describe("image slots in blocks", () => {
  it("Hero1 shows the buyer's image eagerly with its alt text instead of the artwork", () => {
    render(<Hero1 media={{ src: "/shots/app.png", srcDark: "/shots/app-dark.png", alt: "The app dashboard" }} />);
    const imgs = screen.getAllByAltText("The app dashboard");
    expect(imgs).toHaveLength(2);
    expect(imgs[0]).toHaveAttribute("loading", "eager");
    expect(imgs[0]).toHaveAttribute("fetchpriority", "high");
  });

  it("Hero1 accepts a URL plus mediaAlt", () => {
    render(<Hero1 media="/shots/app.png" mediaAlt="Inbox view" />);
    expect(screen.getByRole("img", { name: "Inbox view" })).toHaveAttribute("src", "/shots/app.png");
  });

  it("Hero1 without media renders no <img> (generated artwork only)", () => {
    const { container } = render(<Hero1 />);
    expect(container.querySelector("img")).toBeNull();
  });

  it("Blog1 uses a post's own image and lazy-loads it", () => {
    const { container } = render(
      <Blog1 posts={[{ title: "Hello", excerpt: "x", category: "News", date: "2026-01-01", readMinutes: 2, author: "A", role: "B", href: "#", image: "/cover.jpg", imageAlt: "Cover of Hello" }]} />
    );
    const img = container.querySelector('img[src="/cover.jpg"]');
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("alt", "Cover of Hello");
  });

  it("BlogPost1 loads its cover eagerly", () => {
    const { container } = render(<BlogPost1 image="/post.jpg" imageAlt="The post cover" />);
    const img = container.querySelector('img[src="/post.jpg"]');
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("alt", "The post cover");
  });

  it("Hero1 falls back to the artwork when the image fails to load", () => {
    const { container } = render(<Hero1 media="/missing.png" mediaAlt="Broken" />);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    fireEvent.error(img!);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector('[data-state="fallback"]')).not.toBeNull();
  });
});
