import { ToastStack } from "@/components/ballmac/toast-stack"
export default function ToastStackDemo() {
  return (
    <ToastStack
      className="w-full max-w-sm"
      durationMs={0}
      defaultToasts={[
        {
          id: "saved",
          title: "Changes saved",
          description: "Your team can see the latest version.",
          tone: "success",
        },
        {
          id: "invite",
          title: "Invitation sent",
          description: "Alex can join the workspace from their email.",
          tone: "info",
        },
      ]}
    />
  )
}
