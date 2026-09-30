import { ToastStack } from "@/components/ballmac/toast-stack"
export default function ToastStackStates() {
  return (
    <ToastStack
      className="w-full max-w-sm"
      durationMs={0}
      defaultToasts={[
        {
          id: "retry",
          title: "Upload paused",
          description: "Check your connection and try again.",
          tone: "error",
        },
      ]}
    />
  )
}
