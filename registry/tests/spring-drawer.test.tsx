import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  SpringDrawer,
  SpringDrawerBody,
  SpringDrawerContent,
  SpringDrawerDescription,
  SpringDrawerHeader,
  SpringDrawerTitle,
  SpringDrawerTrigger,
} from "@/components/ballmac/spring-drawer";

beforeEach(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterEach(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function Example(props: Partial<React.ComponentProps<typeof SpringDrawer>>) {
  return (
    <SpringDrawer {...props}>
      <SpringDrawerTrigger>Open</SpringDrawerTrigger>
      <SpringDrawerContent>
        <SpringDrawerHeader>
          <SpringDrawerTitle>Cart</SpringDrawerTitle>
          <SpringDrawerDescription>Your items</SpringDrawerDescription>
        </SpringDrawerHeader>
        <SpringDrawerBody>Body</SpringDrawerBody>
      </SpringDrawerContent>
    </SpringDrawer>
  );
}

describe("SpringDrawer", () => {
  it("opens as a named dialog from its trigger and closes with Escape, returning focus", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByRole("dialog", { name: "Cart" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.getByRole("button", { name: "Open" })).toHaveFocus();
  });
  it("closes with its close button", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.click(await screen.findByRole("button", { name: "Close" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
  it("has a keyboard-operable handle when there are several snap points", async () => {
    const user = userEvent.setup();
    const onSnapChange = vi.fn();
    render(<Example snapPoints={[0.4, 0.7, 1]} defaultSnap={0} onSnapChange={onSnapChange} />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    const handle = await screen.findByRole("slider", { name: "Resize drawer" });
    expect(handle).toHaveAttribute("aria-valuenow", "0");
    expect(handle).toHaveAttribute("aria-valuetext", "40% of the screen");
    handle.focus();
    await user.keyboard("{ArrowUp}");
    expect(onSnapChange).toHaveBeenCalledWith(1);
    expect(handle).toHaveAttribute("aria-valuenow", "1");
    await user.keyboard("{End}");
    expect(handle).toHaveAttribute("aria-valuetext", "100% of the screen");
    await user.keyboard("{Home}");
    expect(handle).toHaveAttribute("aria-valuenow", "0");
  });
  it("has no slider when there is a single snap point", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");
    expect(screen.queryByRole("slider")).toBeNull();
  });
  it("opens from the side", async () => {
    const user = userEvent.setup();
    render(<Example side="right" />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAttribute("data-side", "right");
  });
});
