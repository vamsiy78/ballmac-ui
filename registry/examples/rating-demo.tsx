import { Rating } from "@/components/ballmac/rating"
export default function RatingDemo() {
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-5 shadow-sm">
      <p className="mb-4 text-sm text-muted-foreground">
        How useful was this setup guide?
      </p>
      <Rating label="Rate this guide" defaultValue={4} />
    </div>
  )
}
