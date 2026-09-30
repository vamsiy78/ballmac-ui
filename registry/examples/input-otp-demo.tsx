"use client";
import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ballmac/input-otp";
export default function InputOtpDemo() {
  const [value, setValue] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "error" | "ok">("idle");
  return (
    <div className="grid w-full max-w-sm gap-4 rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
          <ShieldCheck aria-hidden="true" className="size-5" />
        </span>
        <div>
          <label htmlFor="otp-code" className="text-sm font-semibold">Verification code</label>
          <p id="otp-hint" className="text-xs text-muted-foreground">Enter the 6 digits we sent to j••••@acme.example. Try 123456.</p>
        </div>
      </div>
      <InputOTP
        id="otp-code"
        maxLength={6}
        value={value}
        aria-describedby="otp-hint otp-status"
        aria-invalid={status === "error" || undefined}
        onChange={(v) => {
          setValue(v);
          setStatus("idle");
        }}
        onComplete={(v) => setStatus(v === "123456" ? "ok" : "error")}
        pattern="^[0-9]*$"
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <p id="otp-status" role="status" className={status === "error" ? "text-sm text-destructive" : status === "ok" ? "text-sm text-chart-2" : "sr-only"}>
        {status === "error" ? "That code is not right. Try again." : status === "ok" ? "Verified. You are all set." : ""}
      </p>
    </div>
  );
}
