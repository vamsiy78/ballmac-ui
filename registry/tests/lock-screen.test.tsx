import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { LockScreen } from "@/components/ballmac/lock-screen";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});

describe("LockScreen (mac)", () => {
  it("shows a fixed clock, the name and a labelled password field", () => {
    render(<LockScreen time="9:41" date="Thu Oct 1" name="Alex Morgan" />);
    expect(screen.getByRole("region", { name: "Lock screen" })).toBeInTheDocument();
    expect(screen.getByText("9:41")).toBeInTheDocument();
    expect(screen.getByText("Thu Oct 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Password for Alex Morgan")).toHaveAttribute("type", "password");
  });
  it("rejects a wrong password with an alert and keeps the screen", async () => {
    const user = userEvent.setup();
    const onLockedChange = vi.fn();
    render(<LockScreen time="9:41" date="Thu Oct 1" password="hello" onLockedChange={onLockedChange} />);
    await user.type(screen.getByLabelText(/Password for/), "nope{Enter}");
    expect(await screen.findByRole("alert")).toHaveTextContent("Incorrect password");
    expect(screen.getByLabelText(/Password for/)).toHaveAttribute("aria-invalid", "true");
    expect(onLockedChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Password for/)).toHaveValue("");
  });
  it("unlocks with the right password and removes itself", async () => {
    const user = userEvent.setup();
    const onLockedChange = vi.fn();
    render(<LockScreen time="9:41" date="Thu Oct 1" password="hello" onLockedChange={onLockedChange} />);
    await user.type(screen.getByLabelText(/Password for/), "hello");
    await user.click(screen.getByRole("button", { name: "Unlock" }));
    expect(onLockedChange).toHaveBeenCalledWith(false);
    await vi.waitFor(() => expect(screen.queryByRole("region", { name: "Lock screen" })).toBeNull());
  });
  it("lets onUnlock veto and any entry unlock without a password", async () => {
    const user = userEvent.setup();
    const onUnlock = vi.fn(() => false);
    const { unmount } = render(<LockScreen time="9:41" date="Thu Oct 1" onUnlock={onUnlock} />);
    await user.type(screen.getByLabelText(/Password for/), "x{Enter}");
    expect(onUnlock).toHaveBeenCalledWith("x");
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    unmount();
    render(<LockScreen time="9:41" date="Thu Oct 1" />);
    await user.click(screen.getByRole("button", { name: "Unlock" }));
    await vi.waitFor(() => expect(screen.queryByRole("region", { name: "Lock screen" })).toBeNull());
  });
  it("can be controlled", () => {
    const { rerender } = render(<LockScreen locked={false} time="9:41" date="Thu Oct 1" />);
    expect(screen.queryByRole("region", { name: "Lock screen" })).toBeNull();
    rerender(<LockScreen locked time="9:41" date="Thu Oct 1" />);
    expect(screen.getByRole("region", { name: "Lock screen" })).toBeInTheDocument();
  });
});

describe("LockScreen (ios)", () => {
  it("shows notifications and unlocks from the button", async () => {
    const user = userEvent.setup();
    const onLockedChange = vi.fn();
    render(
      <LockScreen variant="ios" time="9:41" date="Thursday, October 1" onLockedChange={onLockedChange}>
        <p>New message</p>
      </LockScreen>
    );
    expect(screen.getByText("Thursday, October 1")).toBeInTheDocument();
    expect(screen.getByText("New message")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Flashlight" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Swipe up to unlock/ }));
    expect(onLockedChange).toHaveBeenCalledWith(false);
  });
});
