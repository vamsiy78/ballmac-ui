import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ballmac/input-group";

describe("InputGroup", () => {
  it("focuses the control when a text addon is clicked but leaves buttons alone", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <InputGroup aria-label="Website">
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Domain" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton aria-label="Copy" onClick={onClick} />
        </InputGroupAddon>
      </InputGroup>,
    );
    expect(screen.getByRole("group", { name: "Website" })).toBeInTheDocument();
    await user.click(screen.getByText("https://"));
    expect(screen.getByRole("textbox", { name: "Domain" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Copy" })).toHaveFocus();
  });
});
