import { Rating } from "@/components/ballmac/rating"
export default function RatingStates() {
  return (
    <div className="w-full max-w-sm">
      <Rating label="Rate your experience" max={5} showValue={false} />
    </div>
  )
}
