import { cn } from "@/lib/utils"

/**
 * The name, large, drawn as a field of dots that fades toward the bottom of the page. Decorative: the footer already names the brand in text, so it is hidden
 * from assistive technology. It is a still graphic (no motion to switch off) and takes its colour from the text colour, so it follows light and dark themes.
 */
export function FooterWordmark({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("text-foreground pointer-events-none select-none", className)}>
      <svg viewBox="0 0 1000 240" className="block w-full" role="presentation" focusable="false">
        <defs>
          <pattern id="bm-footer-dots" width="9" height="9" patternUnits="userSpaceOnUse">
            <circle cx="4.5" cy="4.5" r="2.1" fill="currentColor" />
          </pattern>
          <linearGradient id="bm-footer-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="white" stopOpacity="0.5" />
            <stop offset="0.55" stopColor="white" stopOpacity="0.2" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="bm-footer-mask">
            <rect width="1000" height="240" fill="url(#bm-footer-fade)" />
          </mask>
        </defs>
        <g mask="url(#bm-footer-mask)">
          <text
            x="0"
            y="205"
            textLength="1000"
            lengthAdjust="spacingAndGlyphs"
            fill="url(#bm-footer-dots)"
            style={{ fontFamily: "var(--font-sans, ui-sans-serif, system-ui, sans-serif)", fontWeight: 700, fontSize: 225, letterSpacing: "-0.04em" }}
          >
            Ballmac
          </text>
        </g>
      </svg>
    </div>
  )
}
