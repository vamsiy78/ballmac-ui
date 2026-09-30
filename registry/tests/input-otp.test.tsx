import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ballmac/input-otp";

function setup(props: { onComplete?: (v: string) => void; pattern?: string } = {}) {
  return render(
    <InputOTP maxLength={4} aria-label="Code" {...props}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>,
  );
}

describe("InputOTP", () => {
  it("is one labelled text input with one-time-code autofill", () => {
    setup();
    const input = screen.getByRole("textbox", { name: "Code" });
    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    expect(input).toHaveAttribute("maxlength", "4");
  });
  it("fills slots as you type, calls onComplete and supports backspace", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const { container } = setup({ onComplete });
    const input = screen.getByRole("textbox", { name: "Code" });
    await user.type(input, "123");
    expect(container.querySelectorAll("[data-filled=true]")).toHaveLength(3);
    await user.keyboard("4");
    expect(onComplete).toHaveBeenCalledWith("1234");
    await user.keyboard("{Backspace}");
    expect(container.querySelectorAll("[data-filled=true]")).toHaveLength(3);
  });
  it("accepts pasted codes and rejects characters that fail the pattern", async () => {
    const user = userEvent.setup();
    const { container } = setup({ pattern: "^[0-9]*$" });
    const input = screen.getByRole("textbox", { name: "Code" });
    await user.type(input, "ab");
    expect(container.querySelectorAll("[data-filled=true]")).toHaveLength(0);
    await user.click(input);
    await user.paste("9876");
    expect(container.querySelectorAll("[data-filled=true]")).toHaveLength(4);
  });
});
