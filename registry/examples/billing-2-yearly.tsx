import { Billing2 } from "@/components/ballmac/blocks/billing-2/billing-2"

export default function Billing2Yearly() {
  return (
    <Billing2
      title="Plans"
      currentPlan="starter"
      currentSeats={3}
      minSeats={3}
      currentInterval="yearly"
      today="2026-10-01"
      renewsOn="2027-03-15"
      currency="EUR"
    />
  )
}
