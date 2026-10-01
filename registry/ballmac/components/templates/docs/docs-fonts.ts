// Ballmac UI: Docs template fonts. https://ui.ballmac.com/templates/template-docs
import { Instrument_Sans, JetBrains_Mono, Newsreader } from "next/font/google"

export const docsSerif = Newsreader({ variable: "--docs-serif", subsets: ["latin"], display: "swap" })
export const docsSans = Instrument_Sans({ variable: "--docs-sans", subsets: ["latin"], display: "swap" })
export const docsMono = JetBrains_Mono({ variable: "--docs-mono", subsets: ["latin"], display: "swap" })
