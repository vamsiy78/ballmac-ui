// Ballmac UI: Portfolio template fonts. https://ui.ballmac.com/templates/template-portfolio
import { Bricolage_Grotesque, Geist_Mono } from "next/font/google"

export const portfolioSans = Bricolage_Grotesque({ variable: "--portfolio-sans", subsets: ["latin"], axes: ["opsz", "wdth"], display: "swap" })
export const portfolioMono = Geist_Mono({ variable: "--portfolio-mono", subsets: ["latin"], display: "swap" })
