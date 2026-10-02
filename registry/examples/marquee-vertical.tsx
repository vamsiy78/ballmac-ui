import { Marquee } from "@/components/ballmac/marquee"

const quotes = [
  { body: "We replaced three internal widgets in an afternoon.", name: "Priya N.", role: "Frontend lead" },
  { body: "The motion is quiet enough for a finance dashboard.", name: "Tomás R.", role: "Product designer" },
  { body: "Dark mode worked on the first try. That never happens.", name: "Mei L.", role: "Staff engineer" },
  { body: "Our agents pick the right component from the docs.", name: "Jonah K.", role: "Platform engineer" },
  { body: "Accessible defaults saved us an audit cycle.", name: "Sara O.", role: "Accessibility lead" },
  { body: "It reads like our own code, not a black box.", name: "Luis M.", role: "Founding engineer" },
]

function Quote({ body, name, role }: (typeof quotes)[number]) {
  return (
    <figure className="w-64 rounded-xl border bg-card p-4 text-sm text-card-foreground">
      <blockquote>“{body}”</blockquote>
      <figcaption className="mt-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{name}</span> · {role}
      </figcaption>
    </figure>
  )
}

export default function MarqueeVertical() {
  return (
    <div className="flex h-80 w-full max-w-xl justify-center gap-4 overflow-hidden">
      <Marquee vertical speed={24} gap={12} className="h-full">
        {quotes.slice(0, 3).map((q) => (
          <Quote key={q.name} {...q}/>
        ))}
      </Marquee>
      <Marquee vertical reverse speed={24} gap={12} className="hidden h-full sm:flex">
        {quotes.slice(3).map((q) => (
          <Quote key={q.name} {...q}/>
        ))}
      </Marquee>
    </div>
  )
}
