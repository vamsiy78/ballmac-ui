// Ballmac UI: Goods template data. https://ui.ballmac.com/templates/template-goods
export type Shape = "mug" | "bowl" | "vase" | "plate" | "pitcher" | "cup"
export type Category = "Mugs" | "Bowls" | "Vases" | "Plates"

export const glazes = [
  { name: "Terracotta", cls: "bg-chart-1", border: "border-chart-1" },
  { name: "Sage", cls: "bg-chart-2", border: "border-chart-2" },
  { name: "Mustard", cls: "bg-chart-3", border: "border-chart-3" },
  { name: "Slate", cls: "bg-chart-4", border: "border-chart-4" },
  { name: "Blush", cls: "bg-chart-5", border: "border-chart-5" },
] as const

export type Product = {
  id: string
  name: string
  category: Category
  shape: Shape
  price: number
  glazes: number[]
  tagline: string
  description: string
  size: string
  rating: number
  reviews: number
  tag?: "New" | "Low stock" | "Bestseller"
  inStock: boolean
}

export const products: Product[] = [
  { id: "morning-mug", name: "Morning mug", category: "Mugs", shape: "mug", price: 34, glazes: [0, 1, 2, 4], tagline: "Thick walls, a thumb rest and room for a proper coffee.", description: "Thrown on the wheel and glazed twice, so the colour pools where your thumb rests. Holds 350 ml, which is exactly one slow coffee.", size: "9 cm × 8 cm · 350 ml", rating: 4.9, reviews: 212, tag: "Bestseller", inStock: true },
  { id: "tea-cup", name: "Tea cup", category: "Mugs", shape: "cup", price: 26, glazes: [1, 3, 4], tagline: "No handle, all warmth.", description: "A handleless cup that sits in two hands. The wide foot keeps it steady on a crowded table.", size: "8 cm × 7 cm · 200 ml", rating: 4.7, reviews: 98, inStock: true },
  { id: "noodle-bowl", name: "Noodle bowl", category: "Bowls", shape: "bowl", price: 48, glazes: [0, 2, 3], tagline: "Deep enough for broth, wide enough for company.", description: "A generous bowl with a slightly turned-in rim that keeps the steam where you want it. Dishwasher and microwave safe.", size: "19 cm × 9 cm · 900 ml", rating: 4.8, reviews: 156, tag: "Bestseller", inStock: true },
  { id: "breakfast-bowl", name: "Breakfast bowl", category: "Bowls", shape: "bowl", price: 36, glazes: [1, 4, 2], tagline: "Porridge, yoghurt, whatever the day needs.", description: "A shallow bowl with a soft speckle that shows through the glaze. Stacks neatly in sets of four.", size: "15 cm × 6 cm · 500 ml", rating: 4.6, reviews: 74, inStock: true },
  { id: "tall-vase", name: "Tall vase", category: "Vases", shape: "vase", price: 78, glazes: [3, 0, 1], tagline: "One stem looks intentional.", description: "A narrow-necked vase built to hold a single branch or three tulips. Watertight, with a ground foot that will not scratch wood.", size: "14 cm × 30 cm", rating: 4.9, reviews: 63, tag: "New", inStock: true },
  { id: "bud-vase", name: "Bud vase", category: "Vases", shape: "vase", price: 42, glazes: [2, 4, 0], tagline: "Small, round and difficult to dislike.", description: "A pocket-sized vase for a single flower from the garden or the corner shop. Makes a good present.", size: "9 cm × 12 cm", rating: 4.8, reviews: 121, inStock: true },
  { id: "dinner-plate", name: "Dinner plate", category: "Plates", shape: "plate", price: 44, glazes: [0, 1, 3, 4], tagline: "A wide rim, a quiet glaze.", description: "A flat plate with a raised rim, glazed in a satin finish that hides knife marks. Sold singly or in fours.", size: "27 cm diameter", rating: 4.7, reviews: 187, inStock: true },
  { id: "side-plate", name: "Side plate", category: "Plates", shape: "plate", price: 28, glazes: [1, 2, 4], tagline: "For toast, cheese and everything in between.", description: "The plate you will reach for ten times a day. Light enough to carry two in one hand.", size: "19 cm diameter", rating: 4.8, reviews: 143, tag: "Low stock", inStock: true },
  { id: "water-pitcher", name: "Water pitcher", category: "Vases", shape: "pitcher", price: 68, glazes: [3, 1, 0], tagline: "A pour that does not drip.", description: "A one-litre pitcher with a pinched spout and a handle you can hold with two fingers. Equally good with flowers.", size: "13 cm × 19 cm · 1 L", rating: 4.9, reviews: 88, tag: "New", inStock: true },
  { id: "serving-bowl", name: "Serving bowl", category: "Bowls", shape: "bowl", price: 62, glazes: [2, 0, 1], tagline: "Big enough for the table.", description: "A wide bowl for salad, pasta or fruit. The inside is glazed in a lighter tone that makes food look good.", size: "28 cm × 12 cm · 2.4 L", rating: 4.8, reviews: 52, inStock: true },
  { id: "espresso-cup", name: "Espresso cup", category: "Mugs", shape: "cup", price: 22, glazes: [0, 3], tagline: "Small, strong, a little bit smug.", description: "A thick-walled cup that keeps a shot warm. Pairs with the Morning mug for people who need both.", size: "6 cm × 6 cm · 90 ml", rating: 4.5, reviews: 41, inStock: false },
  { id: "salad-plate", name: "Salad plate", category: "Plates", shape: "plate", price: 36, glazes: [4, 1, 2], tagline: "Between a dinner and a side.", description: "A 23 cm plate that suits lunch for one. Glazed on both sides so it lasts through years of dishwashers.", size: "23 cm diameter", rating: 4.6, reviews: 66, inStock: true },
]

export const productById = (id: string) => products.find((p) => p.id === id) ?? products[0]!

export const reviewList = [
  { name: "Hannah P.", stars: 5, title: "My favourite thing in the kitchen", body: "I have dropped it twice and it has survived both. The glaze is even prettier in person.", date: "Sep 12, 2026" },
  { name: "Marcus L.", stars: 5, title: "A proper size", body: "Most mugs are too small. This one holds a full coffee and feels good to hold.", date: "Aug 30, 2026" },
  { name: "Aiko T.", stars: 4, title: "Beautiful, a little heavy", body: "Heavier than I expected, in a good way. Shipped with no packing waste, which I loved.", date: "Aug 14, 2026" },
  { name: "Sofia R.", stars: 5, title: "Bought a second set", body: "Gave one to my sister and then bought another for myself. They look better the longer you use them.", date: "Jul 29, 2026" },
]

export const FREE_SHIPPING = 80
export const PROMO = { code: "KILN10", rate: 0.1 }
export const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`
