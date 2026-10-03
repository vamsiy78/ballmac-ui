// Ballmac UI: Ledger template fonts. https://ui.ballmac.com/templates/template-ledger
import { Inter, Newsreader } from "next/font/google"

/** The italic serif used for one emphasised word per heading. Body text uses the system font, like a Mac app. */
export const ledgerSerif = Newsreader({ variable: "--ledger-serif", subsets: ["latin"], style: ["normal", "italic"], display: "swap", preload: false })

/** Used where San Francisco is not installed (Windows, Linux, Android), so the page looks the same everywhere. */
export const ledgerSans = Inter({ variable: "--ledger-sans", subsets: ["latin"], display: "swap", preload: false })
