import { SpinningText } from "@/components/ballmac/spinning-text"

export default function SpinningTextSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <SpinningText text="Now in beta" className="size-28" duration={10} />
      <SpinningText text="Made with care · Since 2024" className="size-40" reverse>
        <span className="text-2xl font-semibold">B</span>
      </SpinningText>
    </div>
  )
}
