import { ShieldCheck } from "lucide-react"
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
} from "@/components/ballmac/alert"
import { buttonVariants } from "@/components/ballmac/button"
export default function AlertDemo() {
  return (
    <Alert variant="success" className="max-w-md">
      <ShieldCheck aria-hidden="true" />
      <AlertTitle>Workspace is protected</AlertTitle>
      <AlertDescription>
        Two-factor authentication is active for every team member. Your security
        review is complete.
      </AlertDescription>
      <AlertAction>
        <a
          href="#security"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Review settings
        </a>
      </AlertAction>
    </Alert>
  )
}
