import { NumberTicker } from "@/components/ballmac/number-ticker"

export default function NumberTickerCurrency() {
  return (
    <NumberTicker
      value={48250.5}
      format={{ style: "currency", currency: "USD", maximumFractionDigits: 2 }}
      className="text-5xl font-semibold"
    />
  )
}
