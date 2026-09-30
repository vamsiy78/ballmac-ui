import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ballmac/alert-dialog";

describe("AlertDialog", () => {
  it("keeps focus in a labelled confirmation and lets the user cancel", async () => {
    const user = userEvent.setup();
    render(
      <AlertDialog>
        <AlertDialogTrigger>Remove file</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Remove file?</AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone.
          </AlertDialogDescription>
          <AlertDialogCancel>Keep file</AlertDialogCancel>
          <AlertDialogAction destructive>Remove</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>,
    );
    const trigger = screen.getByRole("button", { name: "Remove file" });
    await user.click(trigger);
    const dialog = await screen.findByRole("alertdialog", {
      name: "Remove file?",
    });
    expect(dialog).toHaveAccessibleDescription("This cannot be undone.");
    await waitFor(() =>
      expect(dialog.contains(document.activeElement)).toBe(true),
    );
    await user.keyboard("{Enter}");
    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });

  it("reports the chosen action", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <AlertDialog>
        <AlertDialogTrigger>Publish</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Publish now?</AlertDialogTitle>
          <AlertDialogDescription>Visible to everyone.</AlertDialogDescription>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onAction}>Publish</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>,
    );
    await user.click(screen.getByRole("button", { name: "Publish" }));
    await user.click(
      within(await screen.findByRole("alertdialog")).getByRole("button", {
        name: "Publish",
      }),
    );
    expect(onAction).toHaveBeenCalledOnce();
  });
});
