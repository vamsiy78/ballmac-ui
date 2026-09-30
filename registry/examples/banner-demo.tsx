import { Banner } from "@/components/ballmac/banner"
export default function BannerDemo() {
  return (
    <Banner
      className="w-full max-w-lg"
      title="A new workspace view is ready"
      description="Your team can switch to the updated layout at any time."
      action={
        <a
          href="#workspace"
          className="text-primary rounded-sm text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          Explore the update
        </a>
      }
      dismissible
    />
  )
}
