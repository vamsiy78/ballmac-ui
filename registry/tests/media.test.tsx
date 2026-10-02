import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Media } from "@/components/ballmac/media";

afterEach(() => vi.restoreAllMocks());

describe("Media", () => {
  it("renders an image with its alt text, lazily by default", () => {
    render(<Media media="/shot.png" alt="Dashboard" aspect="video" />);
    const img = screen.getByRole("img", { name: "Dashboard" });
    expect(img).toHaveAttribute("src", "/shot.png");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("decoding", "async");
    expect(img.parentElement).toHaveStyle({ aspectRatio: "16 / 9" });
  });

  it("loads an above-the-fold image eagerly with high priority", () => {
    render(<Media media={{ src: "/hero.png", alt: "Hero" }} priority />);
    const img = screen.getByRole("img", { name: "Hero" });
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("fetchpriority", "high");
  });

  it("treats alt='' as decoration and warns when a URL has no alt at all", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container, rerender } = render(<Media media="/a.png" alt="" />);
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
    expect(warn).not.toHaveBeenCalled();
    rerender(<Media media="/b.png" />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("has no alt text"));
  });

  it("passes srcset, sizes, size and object-position through", () => {
    render(<Media media={{ src: "/a.png", alt: "A", srcSet: "/a.png 1x, /a@2x.png 2x", sizes: "50vw", width: 800, height: 600, position: "top" }} />);
    const img = screen.getByRole("img", { name: "A" });
    expect(img).toHaveAttribute("srcset", "/a.png 1x, /a@2x.png 2x");
    expect(img).toHaveAttribute("sizes", "50vw");
    expect(img).toHaveAttribute("width", "800");
    expect(img).toHaveStyle({ objectPosition: "top" });
  });

  it("renders a second file for dark mode", () => {
    render(<Media media={{ src: "/light.png", srcDark: "/dark.png", alt: "Inbox" }} />);
    const imgs = screen.getAllByAltText("Inbox");
    expect(imgs).toHaveLength(2);
    expect(imgs[0]).toHaveClass("dark:hidden");
    expect(imgs[1]).toHaveClass("hidden", "dark:block");
    expect(imgs[1]).toHaveAttribute("src", "/dark.png");
  });

  it("renders your own element in place of an image", () => {
    render(<Media media={<video aria-label="Demo reel" />} />);
    expect(screen.getByLabelText("Demo reel")).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("shows the fallback when there is no media", () => {
    render(<Media fallback={<span>Artwork</span>} aspect="square" />);
    expect(screen.getByText("Artwork")).toBeInTheDocument();
  });

  it("shows the fallback when the file fails, and tries a new file again", () => {
    const onImageError = vi.fn();
    const { rerender } = render(<Media media="/missing.png" alt="Gone" fallback={<span>Artwork</span>} onImageError={onImageError} />);
    fireEvent.error(screen.getByRole("img", { name: "Gone" }));
    expect(onImageError).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Artwork")).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
    rerender(<Media media="/found.png" alt="Found" fallback={<span>Artwork</span>} />);
    expect(screen.getByRole("img", { name: "Found" })).toBeInTheDocument();
  });

  it("accepts a custom ratio", () => {
    const { container } = render(<Media media="/a.png" alt="" aspect="3/2" />);
    expect(container.firstElementChild).toHaveStyle({ aspectRatio: "3 / 2" });
  });
});
