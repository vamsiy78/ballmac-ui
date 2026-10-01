import { Devices1 } from "@/components/ballmac/blocks/devices-1/devices-1"

function Screen({ width, title }: { width: number; title: string }) {
  return (
    <div className="bg-background flex h-full flex-col items-center justify-center gap-3 text-center" style={{ width }}>
      <span className="bg-chart-4/25 flex size-16 items-center justify-center rounded-2xl text-2xl font-bold">T</span>
      <p className="text-2xl font-semibold tracking-tight">{title}</p>
    </div>
  )
}

export default function Devices1Custom() {
  return (
    <Devices1
      eyebrow="Tempo"
      title="Your focus, on every device."
      description="The timer keeps running when you switch devices."
      captions={{ mac: { title: "Mac", description: "Lives in your menu bar." }, ipad: { title: "iPad", description: "A calm full-screen timer." }, iphone: { title: "iPhone", description: "Start a session from the lock screen." }, watch: { title: "Watch", description: "Tap to pause." } }}
      screens={{
        mac: <Screen width={1280} title="Tempo" />,
        ipad: <Screen width={834} title="Focus" />,
        iphone: <Screen width={393} title="24:18" />,
        watch: <div className="flex h-full w-[208px] items-center justify-center bg-black text-3xl font-semibold text-white">24:18</div>,
      }}
    />
  )
}
