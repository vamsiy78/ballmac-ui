"use client"

import { EnvEditor } from "@/components/ballmac/env-editor"

export default function EnvEditorDemo() {
  return (
    <div className="w-full max-w-2xl">
      <EnvEditor
        description="Available to builds and at runtime in Production."
        defaultValue={[
          { key: "DATABASE_URL", value: "postgres://app:s3cret@db.example.com:5432/app" },
          { key: "STRIPE_SECRET_KEY", value: "sk_live_51Hx9d2eZvKYlo2C0" },
          { key: "NEXT_PUBLIC_APP_URL", value: "https://app.example.com" },
        ]}
      />
    </div>
  )
}
