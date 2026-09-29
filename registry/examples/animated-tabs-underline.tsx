import {
  AnimatedTabs,
  AnimatedTabsContent,
  AnimatedTabsList,
  AnimatedTabsTrigger,
} from "@/components/ballmac/animated-tabs"

const sections = {
  account: "Your name, email and the avatar teammates see.",
  security: "Passkeys, sessions and two-step verification.",
  billing: "Plan, invoices and the card on file.",
  notifications: "Choose what reaches your inbox and what stays in the app.",
}

export default function AnimatedTabsUnderline() {
  return (
    <AnimatedTabs variant="underline" defaultValue="account" className="w-full max-w-md">
      <AnimatedTabsList aria-label="Settings">
        {Object.keys(sections).map((key) => (
          <AnimatedTabsTrigger key={key} value={key} className="capitalize">
            {key}
          </AnimatedTabsTrigger>
        ))}
      </AnimatedTabsList>
      {Object.entries(sections).map(([key, text]) => (
        <AnimatedTabsContent key={key} value={key}>
          <p className="text-sm text-muted-foreground">{text}</p>
        </AnimatedTabsContent>
      ))}
    </AnimatedTabs>
  )
}
