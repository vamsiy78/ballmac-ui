import { GoodsShop } from "@/components/ballmac/templates/goods/goods-shop"

export default function TemplateGoodsShop() {
  return (
    <GoodsShop
      hrefs={{ home: "/preview/template-goods-demo", shop: "/preview/template-goods-shop", product: "/preview/template-goods-product", cart: "/preview/template-goods-cart", checkout: "/preview/template-goods-checkout" }}
    />
  )
}
