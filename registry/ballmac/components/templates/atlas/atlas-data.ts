// Ballmac UI: Atlas sample data. https://ui.ballmac.com/templates/template-atlas

export type AtlasPayment = "paid" | "pending" | "refunded"
export type AtlasFulfillment = "unfulfilled" | "shipped" | "delivered"
export type AtlasChannel = "Online store" | "Instagram" | "Wholesale" | "Pop-up"

export type AtlasOrder = {
  id: string
  /** ISO date-time, shown in UTC. */
  date: string
  customerId: string
  channel: AtlasChannel
  payment: AtlasPayment
  fulfillment: AtlasFulfillment
  items: { productId: string; qty: number }[]
}

export type AtlasProduct = { id: string; name: string; category: string; price: number; stock: number; status: "active" | "draft"; hue: number; sold: number }
export type AtlasCustomer = { id: string; name: string; email: string; city: string; segment: "VIP" | "New" | "At risk" | "Regular"; tone: number }

export const products: AtlasProduct[] = [
  { id: "p-01", name: "Field notebook, set of 3", category: "Paper", price: 24, stock: 142, status: "active", hue: 85, sold: 812 },
  { id: "p-02", name: "Brass pen, matte", category: "Writing", price: 58, stock: 7, status: "active", hue: 70, sold: 244 },
  { id: "p-03", name: "Waxed canvas tote", category: "Bags", price: 96, stock: 38, status: "active", hue: 150, sold: 301 },
  { id: "p-04", name: "Linen desk mat", category: "Desk", price: 68, stock: 55, status: "active", hue: 40, sold: 187 },
  { id: "p-05", name: "Graphite pencils, 12", category: "Writing", price: 16, stock: 260, status: "active", hue: 260, sold: 1204 },
  { id: "p-06", name: "Ceramic ink well", category: "Desk", price: 42, stock: 0, status: "active", hue: 200, sold: 98 },
  { id: "p-07", name: "Leather pen roll", category: "Bags", price: 74, stock: 21, status: "active", hue: 30, sold: 156 },
  { id: "p-08", name: "Stitched journal, A5", category: "Paper", price: 32, stock: 9, status: "active", hue: 120, sold: 530 },
  { id: "p-09", name: "Wooden letter tray", category: "Desk", price: 54, stock: 33, status: "draft", hue: 55, sold: 0 },
  { id: "p-10", name: "Wax seal kit", category: "Paper", price: 28, stock: 64, status: "active", hue: 15, sold: 219 },
  { id: "p-11", name: "Fountain pen, steel", category: "Writing", price: 120, stock: 12, status: "active", hue: 230, sold: 143 },
  { id: "p-12", name: "Travel ink, three colours", category: "Writing", price: 36, stock: 5, status: "active", hue: 300, sold: 267 },
]

export const customers: AtlasCustomer[] = [
  { id: "c-01", name: "Amara Okafor", email: "amara@fernhill.co", city: "Lagos", segment: "VIP", tone: 1 },
  { id: "c-02", name: "Lucas Meyer", email: "lucas.meyer@mail.de", city: "Berlin", segment: "Regular", tone: 2 },
  { id: "c-03", name: "Sofia Alvarez", email: "sofia@alvarez.studio", city: "Mexico City", segment: "VIP", tone: 3 },
  { id: "c-04", name: "Hana Kobayashi", email: "hana.k@tokyo.jp", city: "Tokyo", segment: "New", tone: 4 },
  { id: "c-05", name: "Daniel Reyes", email: "dreyes@harbor.io", city: "Manila", segment: "At risk", tone: 5 },
  { id: "c-06", name: "Priya Raman", email: "priya@raman.in", city: "Chennai", segment: "Regular", tone: 1 },
  { id: "c-07", name: "Marcus Lindqvist", email: "marcus@fjord.se", city: "Stockholm", segment: "VIP", tone: 2 },
  { id: "c-08", name: "Elena Rossi", email: "elena@rossi.it", city: "Milan", segment: "Regular", tone: 3 },
  { id: "c-09", name: "Tomás Beltrán", email: "tomas@beltran.ar", city: "Buenos Aires", segment: "New", tone: 4 },
  { id: "c-10", name: "Grace Mutasa", email: "grace@mutasa.zw", city: "Harare", segment: "At risk", tone: 5 },
  { id: "c-11", name: "Noah Fischer", email: "noah.fischer@web.ch", city: "Zürich", segment: "Regular", tone: 1 },
  { id: "c-12", name: "Yuki Tanaka", email: "yuki@tanaka.jp", city: "Osaka", segment: "VIP", tone: 2 },
]

const channels: AtlasChannel[] = ["Online store", "Online store", "Instagram", "Online store", "Wholesale", "Pop-up", "Online store", "Instagram"]
const payments: AtlasPayment[] = ["paid", "paid", "paid", "pending", "paid", "paid", "refunded", "paid", "paid", "pending"]
const fulfilments: AtlasFulfillment[] = ["delivered", "shipped", "unfulfilled", "delivered", "unfulfilled", "shipped", "delivered", "unfulfilled", "delivered", "shipped"]

/** 36 orders over three weeks, newest first. Built from fixed arithmetic so the server and browser agree. */
export const orders: AtlasOrder[] = Array.from({ length: 36 }, (_, i) => {
  const n = 10480 - i
  const day = 29 - Math.floor(i / 2)
  const hour = i % 2 === 0 ? 14 + (i % 5) : 8 + (i % 4)
  const minute = (i * 13) % 60
  const lines = 1 + (i % 3)
  const age = i < 6 ? 0 : i < 14 ? 1 : 2
  const payment = payments[i % payments.length]
  const fulfillment: AtlasFulfillment = payment === "pending" ? "unfulfilled" : age === 0 ? (i % 2 ? "unfulfilled" : "shipped") : fulfilments[i % fulfilments.length]
  return {
    id: `ORD-${n}`,
    date: `2026-09-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`,
    customerId: customers[(i * 5 + 1) % customers.length].id,
    channel: channels[i % channels.length],
    payment,
    fulfillment,
    items: Array.from({ length: lines }, (_, k) => ({ productId: products[(i * 3 + k * 4) % products.length].id, qty: 1 + ((i + k) % 3) })),
  }
})

export const getCustomer = (id: string) => customers.find((c) => c.id === id) ?? customers[0]
export const getProduct = (id: string) => products.find((p) => p.id === id) ?? products[0]
export const orderTotal = (o: AtlasOrder) => o.items.reduce((n, l) => n + getProduct(l.productId).price * l.qty, 0)
export const orderShipping = (o: AtlasOrder) => (orderTotal(o) >= 100 ? 0 : 8)
export const orderGrand = (o: AtlasOrder) => orderTotal(o) + orderShipping(o)

export const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
export const moneyExact = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 })
const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" })
export const formatDate = (iso: string) => dateFmt.format(new Date(iso))
export const formatTime = (iso: string) => timeFmt.format(new Date(iso))

export const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2)

/** Thirty daily revenue figures, the last one being today. */
export const revenueSeries = Array.from({ length: 30 }, (_, i) => {
  const base = 3200 + i * 46 + Math.round(Math.sin(i * 0.9) * 520) + (i % 7 === 5 ? 700 : 0)
  const previous = 2900 + i * 30 + Math.round(Math.cos(i * 0.8) * 430)
  return { day: `Sep ${i + 1}`, revenue: base, previous }
})
