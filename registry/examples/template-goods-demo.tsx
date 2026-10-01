import { GoodsHome } from "@/components/ballmac/templates/goods/goods-home"

export default function TemplateGoodsDemo() {
  return (
    <GoodsHome
      hrefs={{ home: "/preview/template-goods-demo", shop: "/preview/template-goods-shop", product: "/preview/template-goods-product", cart: "/preview/template-goods-cart", checkout: "/preview/template-goods-checkout" }}
    />
  )
}
