// Ballmac UI: Publication template fonts. https://ui.ballmac.com/templates/template-publication
import { DM_Serif_Display, Lora, Public_Sans } from "next/font/google"

export const pubDisplay = DM_Serif_Display({ variable: "--pub-display", subsets: ["latin"], weight: "400", style: ["normal", "italic"], display: "swap" })
export const pubBody = Lora({ variable: "--pub-body", subsets: ["latin"], display: "swap" })
export const pubSans = Public_Sans({ variable: "--pub-sans", subsets: ["latin"], display: "swap" })
