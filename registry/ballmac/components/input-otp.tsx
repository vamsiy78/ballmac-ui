// Ballmac UI: Input OTP. https://ui.ballmac.com/components/input-otp
// Based on shadcn/ui Input OTP (MIT, Copyright (c) 2023 shadcn) on input-otp (MIT, Copyright (c) 2023 Guilherme Rodz), adding an invalid state, a reduced-motion-safe caret, and a filled-slot pop.
"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type InputOTPProps = React.ComponentProps<typeof OTPInput> & {
  /** Classes for the wrapper around the slots (use `className` for the hidden input). */
  containerClassName?: string;
};

/**
 * A one-time-code field. One real input sits under the slots, so paste, autofill (`autoComplete="one-time-code"`),
 * backspace and screen readers all behave like a normal text field.
 */
function InputOTP({ className, containerClassName, ...props }: InputOTPProps) {
  return (
    <OTPInput
      data-slot="input-otp"
      autoComplete="one-time-code"
      inputMode="numeric"
      containerClassName={cn(
        "group/otp flex items-center gap-2 has-disabled:opacity-50",
        containerClassName,
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

type InputOTPGroupProps = React.ComponentProps<"div">;
function InputOTPGroup({ className, ...props }: InputOTPGroupProps) {
  return (
    <div data-slot="input-otp-group" className={cn("flex items-center", className)} {...props} />
  );
}

type InputOTPSlotProps = React.ComponentProps<"div"> & {
  /** Position of this slot in the code, starting at 0. */
  index: number;
  /** Mark the slot invalid (destructive border) without changing the field. */
  invalid?: boolean;
};
function InputOTPSlot({ index, className, invalid, ...props }: InputOTPSlotProps) {
  const context = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = context?.slots[index] ?? {};
  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      data-filled={char ? "true" : undefined}
      data-invalid={invalid || undefined}
      className={cn(
        "relative flex h-11 w-10 items-center justify-center border-y border-e border-input bg-background text-base font-medium tabular-nums shadow-xs transition-[border-color,box-shadow] first:rounded-s-md first:border-s last:rounded-e-md dark:bg-input/30",
        "data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-[3px] data-[active=true]:ring-ring/50",
        "data-[invalid=true]:border-destructive data-[invalid=true]:data-[active=true]:ring-destructive/30!",
        "group-has-[[aria-invalid=true]]/otp:border-destructive group-has-[[aria-invalid=true]]/otp:data-[active=true]:ring-destructive/30!",
        className,
      )}
      {...props}
    >
      <span
        key={char ?? "empty"}
        className={cn(char && "animate-in zoom-in-75 fade-in-0 duration-150 motion-reduce:animate-none")}
      >
        {char}
      </span>
      {hasFakeCaret && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-5 w-px animate-pulse bg-foreground motion-reduce:animate-none" />
        </span>
      )}
    </div>
  );
}

type InputOTPSeparatorProps = React.ComponentProps<"div">;
function InputOTPSeparator(props: InputOTPSeparatorProps) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <Minus aria-hidden="true" className="size-4 text-muted-foreground" />
    </div>
  );
}

export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
  type InputOTPProps,
  type InputOTPGroupProps,
  type InputOTPSlotProps,
  type InputOTPSeparatorProps,
};
