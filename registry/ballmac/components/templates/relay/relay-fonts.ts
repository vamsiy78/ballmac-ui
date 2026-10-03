// Ballmac UI: Relay template fonts. https://ui.ballmac.com/templates/template-relay
import { Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google"

export const relaySans = Hanken_Grotesk({ variable: "--relay-sans", subsets: ["latin"], display: "swap", preload: false })
export const relayMono = IBM_Plex_Mono({ variable: "--relay-mono", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap", preload: false })
