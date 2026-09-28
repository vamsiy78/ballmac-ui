"use client"

import * as React from "react"

import { Button } from "@/components/ballmac/button"

export default function ButtonLoading() {
  const [loading, setLoading] = React.useState(false)
  return (
    <Button
      loading={loading}
      onClick={() => {
        setLoading(true)
        setTimeout(() => setLoading(false), 1600)
      }}
    >
      Save changes
    </Button>
  )
}
