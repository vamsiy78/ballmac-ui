// Ballmac UI: Pocket template data. https://ui.ballmac.com/templates/template-pocket
export const transactions = [
  { name: "Corner Café", detail: "Today, 8:12", amount: -4.8, tone: 1, emoji: "☕" },
  { name: "From Sam", detail: "Yesterday", amount: 120, tone: 0, emoji: "↓" },
  { name: "City Transit", detail: "Yesterday", amount: -2.75, tone: 3, emoji: "🚆" },
  { name: "Market Hall", detail: "Monday", amount: -38.12, tone: 2, emoji: "🥬" },
  { name: "Pilates Studio", detail: "Sunday", amount: -22, tone: 4, emoji: "🧘" },
]

export type Plan = { id: string; name: string; monthly: number; annual: number; blurb: string; features: string[]; featured?: boolean }
export const plans: Plan[] = [
  { id: "free", name: "Free", monthly: 0, annual: 0, blurb: "Everything you need to stop using a spreadsheet.", features: ["Free virtual card", "Instant transfers to friends", "Round-ups to one pot", "Spending insights"] },
  { id: "plus", name: "Plus", monthly: 6, annual: 5, blurb: "For people who travel, save and split things.", features: ["Everything in Free", "Fee-free spending in 40 currencies", "Unlimited savings pots", "Bill splitting with reminders", "Priority chat support"], featured: true },
  { id: "metal", name: "Metal", monthly: 16, annual: 13, blurb: "A heavy card and a lot of perks.", features: ["Everything in Plus", "Metal card, engraved", "Airport lounge passes", "Travel and phone insurance", "Cashback on every purchase"] },
]

export const compare = [
  ["Virtual card", true, true, true],
  ["Physical card", "$5", true, true],
  ["Savings pots", "1", "Unlimited", "Unlimited"],
  ["Foreign spending fee", "1.5%", "None", "None"],
  ["ATM withdrawals a month", "$200", "$800", "Unlimited"],
  ["Bill splitting", false, true, true],
  ["Cashback", false, false, "1%"],
  ["Support", "Chat", "Priority chat", "24/7 phone"],
] as const

export const faqs = [
  { q: "Is Pocket a bank?", a: "Pocket is a money app. Accounts are held at Harbor Bank, N.A., Member FDIC, and your deposits are insured up to $250,000." },
  { q: "How do round-ups work?", a: "Every card purchase is rounded up to the next dollar and the difference moves to your pot. Spend $4.20 and $0.80 is saved." },
  { q: "Are there hidden fees?", a: "No. The Free plan has no monthly fee, no overdraft fee and no minimum balance. Paid plans show their price on this page and nowhere else." },
  { q: "What if I lose my phone?", a: "Sign in on another device, freeze the card in one tap and revoke the old phone. Nothing is stored on the device." },
  { q: "Which countries does it work in?", a: "The card works anywhere Visa does. Sending money to friends is available in 31 countries today." },
  { q: "Can I close my account?", a: "Yes, any time, in the app. Your balance goes to the bank account you choose within one working day." },
]

export const currencies = [["USD", 1, "$"], ["EUR", 0.92, "€"], ["GBP", 0.79, "£"], ["JPY", 156.4, "¥"], ["MXN", 17.1, "MX$"]] as const

export const money = (n: number, digits = 2) => `${n < 0 ? "−" : ""}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`
