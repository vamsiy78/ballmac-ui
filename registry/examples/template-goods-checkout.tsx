import { GoodsCheckout } from "@/components/ballmac/templates/goods/goods-checkout"

export default function TemplateGoodsCheckout() {
  return (
    <GoodsCheckout demo
      hrefs={{ home: "/preview/template-goods-demo", shop: "/preview/template-goods-shop", product: "/preview/template-goods-product", cart: "/preview/template-goods-cart", checkout: "/preview/template-goods-checkout" }}
    />
  )
}
