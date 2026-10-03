// Ballmac UI: Launch template fonts. https://ui.ballmac.com/templates/template-launch
import { Geist_Mono, Schibsted_Grotesk } from "next/font/google"

export const launchSans = Schibsted_Grotesk({ variable: "--launch-sans", subsets: ["latin"], display: "swap", preload: false })
export const launchMono = Geist_Mono({ variable: "--launch-mono", subsets: ["latin"], display: "swap", preload: false })
