"use client"

import { RatingDistribution } from "@/components/ballmac/rating-distribution"

export default function RatingDistributionStatic() {
  return (
    <div className="w-full max-w-md">
      <RatingDistribution counts={{ 5: 12, 4: 3, 3: 1, 2: 0, 1: 0 }} />
    </div>
  )
}
