# Pro batch 6: ecommerce (15)

Looked at (not copied): shadcn ecommerce blocks and examples (MIT), Medusa and Saleor storefront starters (MIT/BSD, patterns only), Shopify Dawn theme (MIT, patterns only), Tailwind Plus and other paid kits for layout ideas only. No code was taken from paid or unlicensed kits. Product pictures in the demos are generated artwork behind the shared `Media` slot, so every block accepts real photos.

| Block | Question it answers |
|---|---|
| ecommerce-pro-1 | What do you sell, and can I narrow it down? Category, price and colour filters, sort, wishlist, quick add |
| ecommerce-pro-2 | Is this the one? Gallery, colour and size on real radio buttons, quantity, add to bag, details |
| ecommerce-pro-3 | Can I look closer without leaving? Quick view dialog |
| ecommerce-pro-4 | What is in my bag? Drawer with steppers, undo and free-delivery progress |
| ecommerce-pro-5 | What will I pay? Cart page with promo code, delivery choice and computed totals |
| ecommerce-pro-6 | Where do I start? Collection tiles |
| ecommerce-pro-7 | What goes with this? Bundle builder with a computed saving |
| ecommerce-pro-8 | When will it arrive? Postcode check with real working-day dates |
| ecommerce-pro-9 | Can I pay now? One-page checkout with an error summary |
| ecommerce-pro-10 | Did it work? Confirmation with copyable order number and tracker |
| ecommerce-pro-11 | What did I order? History with filters, search and Buy again |
| ecommerce-pro-12 | Which one should I buy? Compare table with differences-only |
| ecommerce-pro-13 | Which size? Sliders and a size chart you supply |
| ecommerce-pro-14 | Is the deal real? Countdown, claimed stock and a copyable code |
| ecommerce-pro-15 | What else? Related products carousel |

**Decisions**
- Every number shown is computed from the items (subtotal, discount, tax, total, bundle saving, uptime-style percentages), never typed in, so the parts and the whole cannot disagree.
- Policies are props: promo codes, delivery times and prices, tax rate, return window text, discount thresholds and size charts are sample data to replace.
- Card numbers are never typed into a block. Checkout takes your payment provider's elements through `paymentSlot`; the default is a clearly labelled placeholder.
- Options (size, colour, delivery, payment) are real radio inputs, so arrow keys, grouping and screen-reader announcements come from the browser.
- Delivery dates use a fixed `from` date prop so the server and browser render the same text; pass today's date in your app.
- Countdowns start after mount, summarise the time left in one label instead of reading every second, and flip to an ended message.
- New `ecommerce` block category added to the schema, with its own group on the site.

**Lessons**
- A flex child with `flex-1` collapses its height in a column; use `sm:flex-1`.
- Hex colours are not allowed even for product swatches; use `oklch()` and make swatches a prop.
- Words like "Based on" in copy trip the licence check.
