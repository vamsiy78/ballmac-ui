"use client";
import { buttonVariants } from "@/components/ballmac/button";
import { Toaster, toast } from "@/components/ballmac/toast";
const id = "toast-states";
export default function ToastStates() {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className={buttonVariants({ variant: "outline", size: "sm" })}
        onClick={() =>
          toast.info("New version available", {
            toasterId: id,
            description: "Reload to get the latest changes.",
            duration: 8000,
            action: { label: "Reload", onClick: () => undefined },
            cancel: { label: "Later", onClick: () => undefined },
          })
        }
      >
        Action and cancel
      </button>
      <button
        type="button"
        className={buttonVariants({ variant: "outline", size: "sm" })}
        onClick={() => toast.warning("Storage almost full", { toasterId: id, description: "You have used 92% of your plan." })}
      >
        Warning
      </button>
      <Toaster id={id} position="top-center" />
    </div>
  );
}
