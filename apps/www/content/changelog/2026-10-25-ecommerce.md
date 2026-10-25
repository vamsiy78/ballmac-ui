---
title: "A shop from first look to delivery: listing, product page, bag, checkout and order tracking"
date: 2026-10-25
seq: 7
tags: [components, docs]
summary: "Five ecommerce screens that work together, a hero that asks for one email, a price calculator for seat-based plans, and placeholder product art that needs no photos."
shot: /preview/ecommerce-2-demo
imageAlt: "A product page: a gallery of four colors, the price with a sale tag, color and bundle choices, a quantity stepper and an add to bag button."
---

### New

- `ecommerce-1` is a product listing with filters you can see and clear, sorting, sale prices, ratings, color choices and a bag button that says what it did. `ecommerce-2` is the product page: a gallery you step through with the arrow keys, named choices, a quantity stepper, fine print one tap away and reviews.
- `ecommerce-3` is the shopping bag: quantities change at once and go back with the reason if they cannot be saved, removing leaves an Undo, a promo code says why it failed and a bar shows how far you are from free shipping. `ecommerce-4` is a three-step checkout that names each mistake beside its field and charges nothing when a card is declined.
- `ecommerce-5` is order tracking: the arrival in one sentence, five stages with the current one marked in words, the carrier's log and the right next step. `product-art` draws simple products in your theme's colors, so demos and loading states need no photos.
- `pricing-5` is a price you work out yourself: slide the number of people, see your volume band and the working, switch on add-ons and read the total. `hero-8` asks for one thing, an email, and says what happened.

### Improved

- A new scan, `pnpm a11y:states`, checks interactive screens after they are opened, filled in or switched off, not only as they first load. It found two real problems, now fixed: the number buttons in `cited-answer` were too small to hit, and `memory-panel` lost contrast when memory was switched off.
