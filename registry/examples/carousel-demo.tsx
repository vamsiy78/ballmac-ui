import { BarChart3, Layers, Rocket, ShieldCheck } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPlayPause,
  CarouselPrevious,
} from "@/components/ballmac/carousel";
const slides = [
  { icon: Rocket, title: "Ship faster", text: "Preview every change on its own URL before it reaches customers.", tone: "bg-chart-1/15 text-chart-1", glow: "from-chart-1/15" },
  { icon: Layers, title: "One workspace", text: "Projects, files and approvals live together, with a full history.", tone: "bg-chart-2/15 text-chart-2", glow: "from-chart-2/15" },
  { icon: BarChart3, title: "See what matters", text: "Usage and performance in one dashboard, updated as it happens.", tone: "bg-chart-3/15 text-chart-3", glow: "from-chart-3/15" },
  { icon: ShieldCheck, title: "Secure by default", text: "Roles, audit logs and two-step sign-in are on from day one.", tone: "bg-chart-4/15 text-chart-4", glow: "from-chart-4/15" },
];
export default function CarouselDemo() {
  return (
    <Carousel label="Product highlights" autoplay={6000} opts={{ loop: true }} className="w-full max-w-md">
      <CarouselContent>
        {slides.map(({ icon: Icon, title, text, tone, glow }, i) => (
          <CarouselItem key={title}>
            <div className={`relative flex h-56 flex-col justify-end gap-3 overflow-hidden rounded-2xl border bg-gradient-to-br ${glow} via-card to-card p-6 shadow-sm`}>
              <span aria-hidden="true" className="absolute top-4 end-5 font-mono text-5xl font-semibold text-foreground/[0.06] tabular-nums">
                0{i + 1}
              </span>
              <span className={`flex size-11 items-center justify-center rounded-xl ${tone}`}>
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="-start-3 sm:-start-5" />
      <CarouselNext className="-end-3 sm:-end-5" />
      <div className="mt-3 flex items-center justify-center gap-2">
        <CarouselDots />
        <CarouselPlayPause />
      </div>
    </Carousel>
  );
}
