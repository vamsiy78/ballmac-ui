import { GoodsProduct } from "@/components/ballmac/templates/goods/goods-product"

export default function TemplateGoodsProduct() {
  return (
    <GoodsProduct
      hrefs={{ home: "/preview/template-goods-demo", shop: "/preview/template-goods-shop", product: "/preview/template-goods-product", cart: "/preview/template-goods-cart", checkout: "/preview/template-goods-checkout" }}
    />
  )
}
