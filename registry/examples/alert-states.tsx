import { CircleAlert, Info } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ballmac/alert"
export default function AlertStates() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Alert variant="info">
        <Info aria-hidden="true" />
        <AlertTitle>Scheduled maintenance</AlertTitle>
        <AlertDescription>
          Reports will pause for ten minutes tonight.
        </AlertDescription>
      </Alert>
      <Alert variant="warning">
        <CircleAlert aria-hidden="true" />
        <AlertTitle>Review needed</AlertTitle>
        <AlertDescription>
          One integration needs a new access token.
        </AlertDescription>
      </Alert>
    </div>
  )
}
