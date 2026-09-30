"use client";
import { buttonVariants } from "@/components/ballmac/button";
import { Toaster, toast } from "@/components/ballmac/toast";
const btn = buttonVariants({ variant: "outline", size: "sm" });
export default function ToastDemo() {
  return (
    <div className="grid w-full max-w-sm gap-3 rounded-xl border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Notifications</p>
        <p className="text-xs text-muted-foreground">Each button shows a different toast.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={btn}
          onClick={() => toast("Event created", { description: "Launch review, Friday at 10:00." })}
        >
          Default
        </button>
        <button type="button" className={btn} onClick={() => toast.success("Changes saved")}>
          Success
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => toast.error("Upload failed", { description: "The file is larger than 10 MB." })}
        >
          Error
        </button>
        <button
          type="button"
          className={btn}
          onClick={() =>
            toast("Conversation archived", { action: { label: "Undo", onClick: () => toast.success("Restored") } })
          }
        >
          Undo
        </button>
        <button
          type="button"
          className={btn}
          onClick={() =>
            toast.promise(new Promise((r) => setTimeout(r, 1600)), {
              loading: "Publishing site…",
              success: "Site published",
              error: "Could not publish",
            })
          }
        >
          Promise
        </button>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
