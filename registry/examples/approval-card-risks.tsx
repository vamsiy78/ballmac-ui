import { ApprovalCard } from "@/components/ballmac/approval-card"

export default function ApprovalCardRisks() {
  return (
    <div className="grid w-full max-w-lg gap-3">
      <ApprovalCard
        risk="low"
        title="Read a file"
        description="Needed to answer your question about the config."
        details={[{ label: "Path", value: "./config/app.json" }]}
      />
      <ApprovalCard
        risk="medium"
        title="Edit 3 files"
        description="Applies the change you asked for in the settings module."
        details={[{ label: "Files", value: "settings.ts, form.tsx, settings.test.ts" }]}
      />
      <ApprovalCard
        risk="high"
        title="Send customer data to an external API"
        description="This leaves your network and cannot be recalled."
        details={[{ label: "Host", value: "api.analytics.example.com" }, { label: "Records", value: "1,204 customers" }]}
        preview={'POST /v1/import\ncontent-type: application/json\n\n{ "customers": [ … 1204 items ] }'}
        approveLabel="Send data"
        denyLabel="Don't send"
      />
    </div>
  )
}
