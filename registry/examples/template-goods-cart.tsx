import { GoodsCartPage } from "@/components/ballmac/templates/goods/goods-cart-page"

export default function TemplateGoodsCart() {
  return (
    <GoodsCartPage demo
      hrefs={{ home: "/preview/template-goods-demo", shop: "/preview/template-goods-shop", product: "/preview/template-goods-product", cart: "/preview/template-goods-cart", checkout: "/preview/template-goods-checkout" }}
    />
  )
}
