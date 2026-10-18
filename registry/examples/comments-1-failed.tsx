"use client"

import { Comments1 } from "@/components/ballmac/blocks/comments-1/comments-1"

export default function Comments1Failed() {
  return <Comments1 onPost={() => Promise.reject(new Error("offline"))} />
}
