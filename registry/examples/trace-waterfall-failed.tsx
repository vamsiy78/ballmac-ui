import { TraceWaterfall } from "@/components/ballmac/trace-waterfall"

export default function TraceWaterfallFailed() {
  return (
    <div className="w-full max-w-3xl">
      <TraceWaterfall
        defaultSelected="deploy"
        defaultCollapsed={["tests"]}
        spans={[
          { id: "run", name: "Fix the failing export", kind: "agent", start: 0, duration: 41000 },
          { id: "edit", parentId: "run", name: "Edit 4 files", kind: "tool", start: 800, duration: 9200 },
          { id: "tests", parentId: "run", name: "Run the tests", kind: "tool", start: 10200, duration: 21400 },
          { id: "unit", parentId: "tests", name: "Unit tests", kind: "tool", start: 10300, duration: 8100 },
          { id: "e2e", parentId: "tests", name: "End-to-end tests", kind: "tool", start: 18500, duration: 13000 },
          { id: "deploy", parentId: "run", name: "Deploy to staging", kind: "tool", start: 31800, duration: 9100, status: "error", detail: "The health check failed three times: GET /healthz returned 503." },
        ]}
      />
    </div>
  )
}
