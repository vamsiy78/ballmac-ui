import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import * as React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  SheetDialog,
  SheetDialogButton,
  SheetDialogContent,
  SheetDialogDescription,
  SheetDialogTitle,
  SheetDialogTrigger,
} from "@/components/ballmac/sheet-dialog";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});

function Example({ onOpenChange = vi.fn() }) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} data-testid="window" style={{ position: "relative" }}>
      <SheetDialog container={ref} onOpenChange={onOpenChange}>
        <SheetDialogTrigger>Open</SheetDialogTrigger>
        <SheetDialogContent>
          <SheetDialogTitle>Save?</SheetDialogTitle>
          <SheetDialogDescription>Keep it.</SheetDialogDescription>
          <SheetDialogButton primary>Save</SheetDialogButton>
        </SheetDialogContent>
      </SheetDialog>
    </div>
  );
}

describe("SheetDialog", () => {
  it("opens as a named dialog inside its window and closes with Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog", { name: "Save?" });
    expect(dialog).toHaveAccessibleDescription("Keep it.");
    expect(screen.getByTestId("window")).toContainElement(dialog);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
  it("traps focus inside and returns it to the trigger", async () => {
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Open" });
    await user.click(trigger);
    await screen.findByRole("dialog");
    await user.tab();
    expect(screen.getByRole("dialog")).toContainElement(document.activeElement as HTMLElement);
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });
  it("can be controlled", () => {
    render(
      <SheetDialog open>
        <SheetDialogContent>
          <SheetDialogTitle>Controlled</SheetDialogTitle>
        </SheetDialogContent>
      </SheetDialog>
    );
    expect(screen.getByRole("dialog", { name: "Controlled" })).toBeInTheDocument();
  });
});
