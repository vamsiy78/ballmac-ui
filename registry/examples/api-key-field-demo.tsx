"use client"

import { ApiKeyField } from "@/components/ballmac/api-key-field"

export default function ApiKeyFieldDemo() {
  return (
    <ApiKeyField
      className="w-full max-w-md"
      label="Secret key"
      description="Created Sep 28, 2026. Keep it on your server."
      value="sk-live-7f3a9c1e5b2d4f6a8c0e2b4d6f8a1c3e5b7d9fa1b2"
      visiblePrefix={8}
      visibleSuffix={4}
      onRegenerate={() => {}}
    />
  )
}
