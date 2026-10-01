import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AvatarCircles } from "@/components/ballmac/avatar-circles";

const people = [
  { name: "Ada Lovelace", role: "Engineering", status: "online" as const },
  { name: "Grace Hopper", href: "/grace" },
  { name: "Linus Torvalds" },
  { name: "Margaret Hamilton" },
];

describe("AvatarCircles", () => {
  it("names the group and every person, including presence", () => {
    render(<AvatarCircles people={people} max={3} />);
    expect(screen.getByRole("group", { name: "4 people" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ada Lovelace, online" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Grace Hopper" })).toHaveAttribute("href", "/grace");
  });
  it("shows initials and the overflow count", () => {
    render(<AvatarCircles people={people} max={2} total={20} />);
    expect(screen.getByText("AL")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "and 18 more" })).toHaveTextContent("+18");
  });
  it("makes the overflow a button when a handler is given", async () => {
    const user = userEvent.setup();
    const onOverflowClick = vi.fn();
    render(<AvatarCircles people={people} max={2} onOverflowClick={onOverflowClick} />);
    await user.click(screen.getByRole("button", { name: "and 2 more" }));
    expect(onOverflowClick).toHaveBeenCalledOnce();
  });
  it("puts the tooltip text in the DOM for sighted users but out of the accessible name", () => {
    render(<AvatarCircles people={people} />);
    const tip = screen.getByText("Engineering");
    expect(tip.closest("[aria-hidden=true]")).not.toBeNull();
  });
  it("falls back to initials when a picture fails to load", () => {
    const { container } = render(<AvatarCircles people={[{ name: "Bad Image", src: "/nope.png" }]} />);
    fireEvent.error(container.querySelector("img")!);
    expect(screen.getByText("BI")).toBeInTheDocument();
  });
  it("is reachable with the keyboard", async () => {
    const user = userEvent.setup();
    render(<AvatarCircles people={people} />);
    await user.tab();
    expect(screen.getByRole("button", { name: "Ada Lovelace, online" })).toHaveFocus();
  });
});
