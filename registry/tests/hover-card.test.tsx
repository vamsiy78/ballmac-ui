import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ballmac/hover-card";
describe("HoverCard", () => {
  it("keeps the linked resource reachable by keyboard", async () => {
    const user = userEvent.setup();
    render(
      <HoverCard openDelay={0}>
        <HoverCardTrigger href="#project">Atlas project</HoverCardTrigger>
        <HoverCardContent>Project preview</HoverCardContent>
      </HoverCard>,
    );
    await user.tab();
    expect(screen.getByRole("link", { name: "Atlas project" })).toHaveFocus();
    expect(await screen.findByText("Project preview")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.getByRole("link", { name: "Atlas project" })).toHaveFocus();
  });
});
