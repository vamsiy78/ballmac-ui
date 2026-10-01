import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "template-goods",
  type: "registry:block",
  title: "Kiln & Co: online store",
  description:
    "A five-page store with a bag that persists across pages: a collage home, a filterable shop, a product page with glaze and gallery pickers, a bag with a free-shipping meter and promo code, and a validated checkout. Products are drawn in CSS.",
  category: "templates",
  templateKind: "specialty",
  templatePages: [
    { title: "Home", example: "template-goods-demo", path: "/goods" },
    { title: "Shop", example: "template-goods-shop", path: "/goods/shop" },
    { title: "Product", example: "template-goods-product", path: "/goods/shop/morning-mug" },
    { title: "Bag", example: "template-goods-cart", path: "/goods/cart" },
    { title: "Checkout", example: "template-goods-checkout", path: "/goods/checkout" },
  ],
  fonts: ["Fraunces", "Hanken Grotesk"],
  featured: true,
  tags: ["template", "ecommerce", "store", "shop", "product", "cart", "checkout", "ceramics"],
  files: [
    { path: "components/templates/goods/goods-fonts.ts" },
    { path: "components/templates/goods/goods-data.ts" },
    { path: "components/templates/goods/goods-cart.ts" },
    { path: "components/templates/goods/goods-theme.tsx" },
    { path: "components/templates/goods/goods-home.tsx" },
    { path: "components/templates/goods/goods-shop.tsx" },
    { path: "components/templates/goods/goods-product.tsx" },
    { path: "components/templates/goods/goods-cart-page.tsx" },
    { path: "components/templates/goods/goods-checkout.tsx" },
    { path: "app/goods/page.tsx" },
    { path: "app/goods/shop/page.tsx" },
    { path: "app/goods/shop/[id]/page.tsx" },
    { path: "app/goods/cart/page.tsx" },
    { path: "app/goods/checkout/page.tsx" },
  ],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "sheet", "slider", "progress", "accordion"],
  examples: [
    { name: "template-goods-demo", title: "Home", file: "template-goods-demo.tsx" },
    { name: "template-goods-shop", title: "Shop", file: "template-goods-shop.tsx" },
    { name: "template-goods-product", title: "Product", file: "template-goods-product.tsx" },
    { name: "template-goods-cart", title: "Bag", file: "template-goods-cart.tsx" },
    { name: "template-goods-checkout", title: "Checkout", file: "template-goods-checkout.tsx" },
  ],
  docs: "Pages are at /goods, /goods/shop, /goods/shop/[id], /goods/cart and /goods/checkout. Products, glazes and reviews live in goods-data.ts. The bag is kept in sessionStorage (goods-cart.ts); swap it for your cart API. The promo code in the demo is KILN10. Replace Piece with product photos.",
  ai: {
    summary:
      "Installs a five-page store with a shared bag drawer, filters, a product page, a bag page with free-shipping progress and a validated checkout. Edit goods-data.ts and goodsCss; replace Piece with photos.",
    whenToUse: ["Small online shops and product drops", "Any store that needs filters, a product page, a bag and checkout"],
    whenNotToUse: ["Large catalogues that need server-side search and pagination"],
    composesWith: ["sheet", "slider", "accordion", "progress"],
    a11y: [
      { keys: "Glaze swatches", action: "A radio group; arrow keys change the glaze and the picture follows" },
      { keys: "Bag drawer", action: "Opens from the header; Escape closes it and focus returns to the button" },
      { keys: "Filter chips", action: "Each active filter is a button that removes itself" }
    ],
    customization: ["Replace products and reviews in goods-data.ts", "Swap the cart store for your cart or commerce API", "Replace Piece with product photography", "Edit goodsCss for the palette"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
