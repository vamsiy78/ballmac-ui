import { VideoDialog } from "@/components/ballmac/video-dialog"

export default function VideoDialogAspects() {
  return (
    <div className="grid w-full max-w-xl gap-3 sm:grid-cols-2">
      <VideoDialog title="Quick start" youtubeId="aqz-KE-bpKQ" aspect="square" duration="1:05" />
      <VideoDialog title="Customer story" youtubeId="aqz-KE-bpKQ" aspect="cinema" className="sm:col-span-1" duration="4:20" />
    </div>
  )
}
