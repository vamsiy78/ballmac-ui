// Ballmac UI: Testimonials 1. https://ui.ballmac.com/blocks/testimonials-1
import * as React from "react"

import { Avatar, AvatarFallback } from "@/components/ballmac/avatar"
import { Marquee } from "@/components/ballmac/marquee"
import { cn } from "@/lib/utils"

type Testimonial = {
  quote: string
  name: string
  role: string
}

type Testimonials1Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Small label above the heading. */
  eyebrow?: string
  /** The heading. */
  title?: string
  /** One sentence under the heading. */
  description?: string
  /** Quotes, spread across up to three scrolling columns. */
  testimonials?: Testimonial[]
}

const defaultTestimonials: Testimonial[] = [
  { quote: "We replaced three internal dashboards in a week. The components read like code we would have written, just calmer.", name: "Maya Okafor", role: "Staff engineer, Acme" },
  { quote: "The dock and window pieces made our web app feel native to our Mac users on day one.", name: "Daniel Reyes", role: "Design lead, Lumen" },
  { quote: "I asked our agent for a pricing page and it picked the right blocks, wired them up and the build passed.", name: "Sara Lindqvist", role: "Founder, Halcyon" },
  { quote: "Motion that respects reduced-motion settings out of the box. That alone saved us an audit finding.", name: "Arjun Mehta", role: "Accessibility lead, Meridian" },
  { quote: "Installs into its own folder, so our shadcn/ui button never got overwritten. Small thing, big trust.", name: "Lena Fischer", role: "Frontend engineer, Parallax" },
  { quote: "The globe went into our hero in five minutes and follows our brand color in both themes.", name: "Tom Becker", role: "Growth engineer, Acme" },
  { quote: "Keyboard support everywhere. Our power users noticed before we told them.", name: "Hana Sato", role: "Product manager, Lumen" },
  { quote: "Honest dependencies, real TypeScript types, no surprise packages. It passes our review checklist.", name: "Chris Walker", role: "Platform engineer, Halcyon" },
  { quote: "Our landing page finally looks as considered as the product behind it.", name: "Nadia Haddad", role: "Head of brand, Meridian" },
]

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure data-slot="testimonial-card" className="w-full rounded-2xl border bg-card p-5 text-card-foreground shadow-[0_1px_2px_0_rgb(0_0_0/0.04)]">
      <blockquote className="text-[15px] leading-relaxed text-pretty">&ldquo;{testimonial.quote}&rdquo;</blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        <Avatar>
          <AvatarFallback>{initials(testimonial.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 text-sm">
          <p className="font-medium">{testimonial.name}</p>
          <p className="truncate text-muted-foreground">{testimonial.role}</p>
        </div>
      </figcaption>
    </figure>
  )
}

function Testimonials1({
  eyebrow = "Loved by builders",
  title = "Teams ship calmer interfaces with it.",
  description = "What developers and designers say after putting it in front of their users.",
  testimonials = defaultTestimonials,
  className,
  ...props
}: Testimonials1Props) {
  const columns = [0, 1, 2].map((c) => testimonials.filter((_, i) => i % 3 === c)).filter((col) => col.length > 0)
  return (
    <section data-slot="testimonials-1" className={cn("mx-auto max-w-6xl px-4 py-20 sm:px-6", className)} {...props}>
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-primary">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl">{title}</h2>
        <p className="mt-4 text-lg text-pretty text-muted-foreground">{description}</p>
      </div>
      {/* Scrolling columns on larger screens; a plain list keeps every quote readable on phones. */}
      <div className="relative mt-14 hidden h-[560px] grid-cols-3 gap-5 md:grid">
        {columns.map((col, i) => (
          <Marquee key={i} vertical reverse={i === 1} speed={22 + i * 4} gap={20} fade className="h-full">
            {col.map((t) => (
              <TestimonialCard key={t.name} testimonial={t} />
            ))}
          </Marquee>
        ))}
      </div>
      <ul className="mt-12 grid gap-4 md:hidden">
        {testimonials.slice(0, 4).map((t) => (
          <li key={t.name}>
            <TestimonialCard testimonial={t} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export { Testimonials1, type Testimonials1Props, type Testimonial }
