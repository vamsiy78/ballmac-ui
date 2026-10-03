// Ballmac UI: Muse template fonts. https://ui.ballmac.com/templates/template-muse
import { DM_Sans, Source_Serif_4 } from "next/font/google"

export const museSans = DM_Sans({ variable: "--muse-sans", subsets: ["latin"], display: "swap", preload: false })
/** The reading face for replies: a book serif that stays comfortable for long answers. */
export const museSerif = Source_Serif_4({ variable: "--muse-serif", subsets: ["latin"], display: "swap", preload: false })
