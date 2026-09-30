import { Banner } from "@/components/ballmac/banner"
export default function BannerStates() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <Banner
        title="Everything is synced"
        description="All changes are saved."
        tone="success"
      />
      <Banner
        title="Review your connection"
        description="Updates may take longer than usual."
        tone="warning"
        dismissible
      />
    </div>
  )
}
