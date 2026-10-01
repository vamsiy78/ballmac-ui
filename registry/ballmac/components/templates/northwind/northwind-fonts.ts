// Ballmac UI: Northwind template fonts. https://ui.ballmac.com/templates/template-northwind
import { Figtree, Fraunces } from "next/font/google"

export const northwindSerif = Fraunces({ variable: "--northwind-serif", subsets: ["latin"], axes: ["opsz", "SOFT"], display: "swap" })
export const northwindSans = Figtree({ variable: "--northwind-sans", subsets: ["latin"], display: "swap" })
