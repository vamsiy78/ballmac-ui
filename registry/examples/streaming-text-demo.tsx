import { StreamingText } from "@/components/ballmac/streaming-text"

export default function StreamingTextDemo() {
  return (
    <div className="w-full max-w-lg text-sm leading-7">
      <StreamingText
        animate
        speed={60}
        text={"The build failed because `motion` wasn't installed.\nRun the add command again and the CLI will install it for you."}
      />
    </div>
  )
}
