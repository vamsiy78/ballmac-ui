// Ballmac UI: Summit template fonts. https://ui.ballmac.com/templates/template-summit
import { Figtree, Unbounded } from "next/font/google"

export const summitDisplay = Unbounded({ variable: "--summit-display", subsets: ["latin"], display: "swap", preload: false })
export const summitSans = Figtree({ variable: "--summit-sans", subsets: ["latin"], display: "swap", preload: false })
