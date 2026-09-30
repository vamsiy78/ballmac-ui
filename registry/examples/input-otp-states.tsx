import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ballmac/input-otp";
export default function InputOtpStates() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <p className="text-sm font-medium">PIN</p>
        <InputOTP maxLength={4} aria-label="PIN" defaultValue="42" pattern="^[0-9]*$">
          <InputOTPGroup>
            {[0, 1, 2, 3].map((i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      <div className="grid gap-2">
        <p className="text-sm font-medium">Invalid</p>
        <InputOTP maxLength={4} aria-label="Invalid PIN" defaultValue="0000" aria-invalid="true">
          <InputOTPGroup>
            {[0, 1, 2, 3].map((i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      <div className="grid gap-2">
        <p className="text-sm font-medium">Disabled</p>
        <InputOTP maxLength={4} aria-label="Disabled PIN" disabled defaultValue="1234">
          <InputOTPGroup>
            {[0, 1, 2, 3].map((i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
    </div>
  );
}
