import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ballmac/button-group";

describe("ButtonGroup", () => {
  it("names the group and keeps each action in the tab order", async () => {
    const user = userEvent.setup();
    render(
      <ButtonGroup aria-label="Document actions" orientation="vertical">
        <button type="button">Copy</button>
        <ButtonGroupSeparator />
        <button type="button">Download</button>
      </ButtonGroup>,
    );
    expect(
      screen.getByRole("group", { name: "Document actions" }),
    ).toHaveAttribute("data-orientation", "vertical");
    await user.tab();
    expect(screen.getByRole("button", { name: "Copy" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Download" })).toHaveFocus();
  });
});
