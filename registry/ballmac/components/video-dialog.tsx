// Ballmac UI: Video Dialog. https://ui.ballmac.com/components/video-dialog
"use client"

import * as React from "react"
import { Play, X } from "lucide-react"

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ballmac/dialog"
import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type VideoDialogProps = Omit<React.ComponentProps<"button">, "title" | "children"> & {
  /** Name of the video. Read by screen readers and used as the frame's title. */
  title: string
  /** A video file to play with the browser's own player. */
  src?: string
  /** A page to embed instead, such as a Vimeo player URL. */
  embedUrl?: string
  /** A YouTube video id. Plays from the privacy-friendly youtube-nocookie.com domain. */
  youtubeId?: string
  /** Image shown on the button. */
  thumbnail?: string
  /** Describes the thumbnail for screen readers. Leave empty when the title already says it. */
  thumbnailAlt?: string
  /** Length shown on the button, such as "2:41". */
  duration?: string
  /** Shape of the video frame. */
  aspect?: "video" | "square" | "cinema"
  /** Controlled open state. */
  open?: boolean
  /** Called when the dialog opens or closes. */
  onOpenChange?: (open: boolean) => void
  /** Classes for the thumbnail button. */
  className?: string
}

const ASPECT = { video: "aspect-video", square: "aspect-square", cinema: "aspect-[21/9]" }

function embedFor({ embedUrl, youtubeId }: Pick<VideoDialogProps, "embedUrl" | "youtubeId">) {
  if (youtubeId) return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?autoplay=1&rel=0&modestbranding=1`
  return embedUrl
}

function VideoDialog({ title, src, embedUrl, youtubeId, thumbnail, thumbnailAlt = "", duration, aspect = "video", open, onOpenChange, className, ...props }: VideoDialogProps) {
  const msg = useMessages()
  const embed = embedFor({ embedUrl, youtubeId })
  const [loaded, setLoaded] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) setLoaded(false); onOpenChange?.(next) }}>
      <DialogTrigger
        data-slot="video-dialog-trigger"
        className={cn(
          "group/video relative block w-full overflow-hidden rounded-2xl border bg-muted text-start outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          ASPECT[aspect],
          className
        )}
        {...props}
      >
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnail} alt={thumbnailAlt} className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover/video:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover/video:scale-100" />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(120%_120%_at_20%_10%,color-mix(in_oklab,var(--chart-1)_35%,var(--card)),var(--card))]" />
        )}
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span aria-hidden="true" className="relative flex size-16 items-center justify-center rounded-full bg-white/95 text-black shadow-[0_8px_30px_rgb(0_0_0/0.35)] transition-transform duration-200 group-hover/video:scale-110 group-focus-visible/video:scale-110 motion-reduce:transition-none sm:size-20">
            <span className="absolute inset-0 rounded-full bg-white/70 opacity-0 group-hover/video:animate-ping motion-reduce:animate-none" />
            <Play className="relative ms-1 size-6 fill-current sm:size-7" />
          </span>
        </span>
        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white">
          <span className="text-sm font-medium drop-shadow-sm sm:text-base">
            <span className="sr-only">{msg("video-dialog.playVideo", "Play video: {title}", { title })}</span> <span aria-hidden="true">{title}</span>
          </span>
          {duration && <span className="rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-xs tabular-nums backdrop-blur">{duration}</span>}
        </span>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="w-[min(64rem,calc(100%-1.5rem))] max-w-none gap-0 overflow-hidden border-0 bg-black p-0 text-white sm:max-w-5xl sm:p-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{msg("video-dialog.videoPlayerPressEscapeTo", "Video player. Press Escape to close.")}</DialogDescription>
        <div className={cn("relative w-full bg-black", ASPECT[aspect])}>
          {!loaded && <span aria-hidden="true" className="absolute inset-0 animate-pulse bg-white/5 motion-reduce:animate-none" />}
          {src ? (
            <video src={src} poster={thumbnail} controls autoPlay playsInline onLoadedData={() => setLoaded(true)} className="absolute inset-0 size-full">
              <track kind="captions" />
            </video>
          ) : embed ? (
            <iframe
              src={embed}
              title={title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={() => setLoaded(true)}
              className="absolute inset-0 size-full border-0"
            />
          ) : null}
        </div>
        <DialogClose
          aria-label={msg("video-dialog.closeVideo", "Close video")}
          className="absolute top-2.5 end-2.5 inline-flex size-9 items-center justify-center rounded-full bg-black/60 text-white outline-none backdrop-blur transition-colors hover:bg-black/80 focus-visible:ring-[3px] focus-visible:ring-white/60"
        >
          <X aria-hidden="true" className="size-4" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}

export { VideoDialog, type VideoDialogProps }
