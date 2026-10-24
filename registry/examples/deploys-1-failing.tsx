"use client"

import { Deploys1 } from "@/components/ballmac/blocks/deploys-1/deploys-1"

export default function Deploys1Failing() {
  return <Deploys1 onRollback={() => Promise.reject(new Error("A deploy is already running."))} />
}
