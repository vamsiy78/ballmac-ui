"use client"

import { Search1 } from "@/components/ballmac/blocks/search-1/search-1"

export default function Search1NoResults() {
  return <Search1 state="empty" defaultQuery="webhok" didYouMean="webhook" />
}
