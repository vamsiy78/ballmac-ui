// Ballmac UI: Studio template fonts. https://ui.ballmac.com/templates/template-studio
import { Archivo, Geist_Mono } from "next/font/google"

/** Archivo has a width axis, so headlines can run wide and heavy while body copy stays normal. */
export const studioSans = Archivo({ variable: "--studio-sans", subsets: ["latin"], axes: ["wdth"], display: "swap", preload: false })
export const studioMono = Geist_Mono({ variable: "--studio-mono", subsets: ["latin"], display: "swap", preload: false })
