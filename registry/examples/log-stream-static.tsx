import { LogStream, type LogLine } from "@/components/ballmac/log-stream"

const base = Date.UTC(2026, 8, 30, 9, 15, 0)
const lines: LogLine[] = [
  { id: 1, level: "info", source: "api", message: "GET /v1/projects 200 in 38 ms" },
  { id: 2, level: "info", source: "api", message: "POST /v1/customers 201 in 112 ms" },
  { id: 3, level: "warn", source: "api", message: "Slow query on customers.by_email took 1.4 s" },
  { id: 4, level: "error", source: "worker", message: "Job invoice.send failed: connect ETIMEDOUT 10.0.4.12:587" },
  { id: 5, level: "debug", source: "worker", message: "Retry scheduled for job invoice.send in 30 s (attempt 2 of 5)" },
  { id: 6, level: "info", source: "api", message: "GET /v1/customers/cus_91 200 in 21 ms" },
  { id: 7, level: "error", source: "api", message: "POST /v1/subscriptions 500: unique constraint violated" },
  { id: 8, level: "info", source: "worker", message: "Job invoice.send succeeded after 2 attempts" },
].map((l, i) => ({ ...l, time: base + i * 4_300 })) as LogLine[]

export default function LogStreamStatic() {
  return (
    <div className="w-full max-w-2xl">
      <LogStream title="Last hour" lines={lines} height="15rem" wrap />
    </div>
  )
}
