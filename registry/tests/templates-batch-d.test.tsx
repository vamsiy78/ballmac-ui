import * as React from "react"
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest"

import { DocsChangelog } from "@/components/ballmac/templates/docs/docs-changelog"
import { DocsGuide } from "@/components/ballmac/templates/docs/docs-guide"
import { DocsHome } from "@/components/ballmac/templates/docs/docs-home"
import { DocsReference } from "@/components/ballmac/templates/docs/docs-reference"
import { DocsSearch } from "@/components/ballmac/templates/docs/docs-search"
import { cart } from "@/components/ballmac/templates/goods/goods-cart"
import { GoodsCartPage } from "@/components/ballmac/templates/goods/goods-cart-page"
import { GoodsCheckout } from "@/components/ballmac/templates/goods/goods-checkout"
import { GoodsHome } from "@/components/ballmac/templates/goods/goods-home"
import { GoodsProduct } from "@/components/ballmac/templates/goods/goods-product"
import { GoodsShop } from "@/components/ballmac/templates/goods/goods-shop"
import { PocketDownload } from "@/components/ballmac/templates/pocket/pocket-download"
import { PocketFeatures } from "@/components/ballmac/templates/pocket/pocket-features"
import { PocketHome } from "@/components/ballmac/templates/pocket/pocket-home"
import { PocketPricing } from "@/components/ballmac/templates/pocket/pocket-pricing"
import { PocketSecurity } from "@/components/ballmac/templates/pocket/pocket-security"
import { SummitHome } from "@/components/ballmac/templates/summit/summit-home"
import { SummitSchedule } from "@/components/ballmac/templates/summit/summit-schedule"
import { SummitSpeakers } from "@/components/ballmac/templates/summit/summit-speakers"
import { SummitTickets } from "@/components/ballmac/templates/summit/summit-tickets"
import { SummitVenue } from "@/components/ballmac/templates/summit/summit-venue"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})
afterEach(() => cleanup())

describe("Docs", () => {
  it("opens the search with the keyboard shortcut and finds a guide", async () => {
    render(<DocsHome />)
    expect(screen.getByRole("search")).toBeInTheDocument()
    fireEvent.keyDown(document, { key: "k", metaKey: true })
    expect(await screen.findByRole("dialog", { name: "Search the docs" })).toBeInTheDocument()
    expect(within(screen.getByRole("dialog")).getAllByText("Delivery guarantees").length).toBeGreaterThan(0)
  })

  it("keeps the language tab in sync and asks what was missing after a no", async () => {
    const user = userEvent.setup()
    window.localStorage.clear()
    render(<DocsGuide />)
    const python = screen.getAllByRole("tab", { name: "Python" })
    await user.click(python[0]!)
    for (const tab of screen.getAllByRole("tab", { name: "Python" })) expect(tab).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("navigation", { name: "On this page" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "No" }))
    await user.type(screen.getByLabelText("What was missing or confusing?"), "More Go examples")
    await user.click(screen.getByRole("button", { name: "Send feedback" }))
    expect(screen.getByText("Thanks. We read every note.")).toBeInTheDocument()
  })

  it("filters endpoints by method and by text, with an empty state", async () => {
    const user = userEvent.setup()
    render(<DocsReference />)
    expect(screen.getByText("6 endpoints")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "DELETE" }))
    expect(screen.getByText("1 endpoint")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "All" }))
    await user.type(screen.getByRole("searchbox", { name: "Filter endpoints" }), "zzzz")
    expect(screen.getByText(/No endpoint matches/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Clear filters" }))
    expect(screen.getByText("6 endpoints")).toBeInTheDocument()
  })

  it("searches, highlights matches, filters by type and suggests terms when empty", async () => {
    const user = userEvent.setup()
    render(<DocsSearch initialQuery="queue" />)
    expect(document.querySelectorAll("mark").length).toBeGreaterThan(0)
    await user.click(screen.getByRole("button", { name: /^API reference/ }))
    expect(screen.getByText(/results? for “queue”/)).toBeInTheDocument()
    await user.clear(screen.getByRole("searchbox", { name: "Search the docs" }))
    await user.type(screen.getByRole("searchbox", { name: "Search the docs" }), "zzzz")
    expect(screen.getByText(/Nothing for/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "retry" }))
    expect(screen.getByRole("searchbox", { name: "Search the docs" })).toHaveValue("retry")
  })

  it("filters the changelog by tag", async () => {
    const user = userEvent.setup()
    render(<DocsChangelog />)
    expect(screen.getByText("6 releases")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Breaking" }))
    expect(screen.getByText("1 release")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Regions are explicit" })).toBeInTheDocument()
  })
})

describe("Summit", () => {
  it("shows the days to go once mounted", async () => {
    render(<SummitHome />)
    await waitFor(() => expect(screen.getByText(/days until the doors open/)).toBeInTheDocument())
  })

  it("saves talks to the agenda and flags a clash", async () => {
    const user = userEvent.setup()
    render(<SummitSchedule />)
    expect(screen.getByText(/Nothing saved yet/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Add Pagers are a design problem to my agenda/ }))
    await user.click(screen.getByRole("button", { name: /Add The weight between regular and bold to my agenda/ }))
    expect(screen.getByText(/2 of your talks run at the same time/)).toBeInTheDocument()
    expect(screen.getAllByText("Clash")).toHaveLength(2)
    await user.click(screen.getByRole("button", { name: /Remove The weight between regular and bold from my agenda/ }))
    expect(screen.queryByText("Clash")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Day 2/ }))
    expect(screen.getByText(/talks on Saturday 15 May/)).toBeInTheDocument()
  })

  it("filters speakers and opens a bio in a dialog", async () => {
    const user = userEvent.setup()
    render(<SummitSpeakers />)
    await user.click(screen.getByRole("button", { name: "Systems" }))
    expect(screen.getByText("4 speakers")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Kofi Mensah/ }))
    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByText("Pagers are a design problem")).toBeInTheDocument()
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it("calculates the order and validates the buyer", async () => {
    const user = userEvent.setup()
    render(<SummitTickets />)
    for (let i = 0; i < 4; i++) await user.click(screen.getByRole("button", { name: "More tickets" }))
    expect(screen.getByText("Group discount (15%)")).toBeInTheDocument()
    await user.type(screen.getByLabelText("Promo code"), "NORTH10")
    await user.click(screen.getByRole("button", { name: "Apply" }))
    expect(screen.getByText("NORTH10 applied: 10% off.")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^Pay/ }))
    expect(screen.getByText("Tell us who the ticket is for.")).toBeInTheDocument()
    expect(screen.getByLabelText("Full name")).toHaveFocus()
    await user.type(screen.getByLabelText("Full name"), "Ada Lovelace")
    await user.type(screen.getByLabelText("Email for the receipt"), "ada@example.com")
    await user.click(screen.getByRole("button", { name: /^Pay/ }))
    expect(screen.getByText(/You are going, Ada/)).toBeInTheDocument()
  })

  it("switches how to get there", async () => {
    const user = userEvent.setup()
    render(<SummitVenue />)
    await user.click(screen.getByRole("button", { name: "City bus" }))
    expect(screen.getByText("Lines 1, 3 and 11 stop at the door")).toBeInTheDocument()
  })
})

describe("Goods", () => {
  beforeEach(() => {
    cart.clear()
    window.sessionStorage.clear()
  })

  it("adds from a product card to the bag count and the drawer", async () => {
    const user = userEvent.setup()
    render(<GoodsHome />)
    await user.click(screen.getAllByRole("button", { name: "Add to bag" })[0]!)
    expect(screen.getByRole("button", { name: "Open your bag, 1 item" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Open your bag/ }))
    const drawer = await screen.findByRole("dialog")
    expect(within(drawer).getByText("Morning mug")).toBeInTheDocument()
    await user.click(within(drawer).getByRole("button", { name: "More Morning mug" }))
    expect(within(drawer).getByText("$68")).toBeInTheDocument()
  })

  it("filters the shop and shows active chips", async () => {
    const user = userEvent.setup()
    render(<GoodsShop />)
    const side = within(screen.getByRole("complementary", { name: "Filters" }))
    expect(screen.getByText("12 pieces")).toBeInTheDocument()
    await user.click(side.getByRole("button", { name: /^Mugs/ }))
    expect(screen.getByText("3 pieces")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Remove filter Mugs" }))
    expect(screen.getByText("12 pieces")).toBeInTheDocument()
    await user.click(side.getByRole("checkbox", { name: "In stock only" }))
    expect(screen.getByText("11 pieces")).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText("Sort"), "high")
    expect(within(screen.getAllByRole("listitem")[0]!).getByText("Tall vase")).toBeInTheDocument()
  })

  it("lets you pick a glaze and add to the bag", async () => {
    const user = userEvent.setup()
    render(<GoodsProduct slug="noodle-bowl" />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Noodle bowl")
    await user.click(screen.getByRole("radio", { name: "Slate" }))
    expect(screen.getByText(/Showing the front view in Slate/)).toBeInTheDocument()
    await user.click(screen.getByRole("radio", { name: "Close up" }))
    expect(screen.getByText(/Showing the close up view in Slate/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "More" }))
    await user.click(screen.getByRole("button", { name: /Add to bag ·/ }))
    expect(screen.getByText(/Added to your bag/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Open your bag, 2 items" })).toBeInTheDocument()
  })

  it("applies a promo code in the bag and carries it to checkout, then thanks the buyer", async () => {
    const user = userEvent.setup()
    window.sessionStorage.removeItem("kiln-bag")
    render(<GoodsCartPage demo />)
    await screen.findByText("Morning mug")
    await user.type(screen.getByLabelText("Promo code"), "KILN10")
    await user.click(screen.getByRole("button", { name: "Apply" }))
    expect(screen.getByText("KILN10 applied: 10% off.")).toBeInTheDocument()
    cleanup()
    render(<GoodsCheckout />)
    expect(screen.getByText(/Promo KILN10/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^Pay/ }))
    expect(screen.getByText("Enter an email like you@example.com.")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toHaveFocus()
    await user.type(screen.getByLabelText("Email"), "a@b.co")
    await user.type(screen.getByLabelText("Full name"), "Ada L")
    await user.type(screen.getByLabelText("Address"), "1 High St")
    await user.type(screen.getByLabelText("Town or city"), "Bristol")
    await user.type(screen.getByLabelText("Postcode"), "bs11aa")
    await user.type(screen.getByLabelText("Card number"), "4242424242424242")
    await user.type(screen.getByLabelText("Expiry"), "1230")
    await user.type(screen.getByLabelText("Security code"), "123")
    await user.click(screen.getByRole("button", { name: /^Pay/ }))
    expect(screen.getByText(/Order KC-48213 is confirmed/)).toBeInTheDocument()
  })
})

describe("Pocket", () => {
  it("switches tabs inside the phone and freezes the card", async () => {
    const user = userEvent.setup()
    render(<PocketHome />)
    await user.click(screen.getByRole("tab", { name: "Card" }))
    await user.click(screen.getByRole("switch", { name: "Freeze card" }))
    expect(screen.getByText("Frozen")).toBeInTheDocument()
    await user.click(screen.getByRole("tab", { name: "Save" }))
    expect(screen.getByText("Holiday fund")).toBeInTheDocument()
  })

  it("recalculates round-ups with the keyboard and converts money", async () => {
    const user = userEvent.setup()
    render(<PocketFeatures />)
    const slider = screen.getByRole("slider", { name: "Monthly spending" })
    act(() => slider.focus())
    await user.keyboard("{ArrowRight}")
    expect(slider).toHaveAttribute("aria-valuenow", "950")
    await user.click(screen.getByRole("button", { name: "Remind Joe" }))
    expect(screen.getByText("1 still to pay.")).toBeInTheDocument()
    await user.clear(screen.getByLabelText("You send (USD)"))
    await user.type(screen.getByLabelText("You send (USD)"), "200")
    await user.click(screen.getByRole("button", { name: "GBP" }))
    expect(screen.getByText("£158.00")).toBeInTheDocument()
    await user.click(screen.getByRole("switch", { name: /Freeze card/ }))
    expect(screen.getByText("Payments are off. Nothing can be charged.")).toBeInTheDocument()
  })

  it("switches between monthly and yearly prices", async () => {
    const user = userEvent.setup()
    render(<PocketPricing />)
    expect(screen.getByText("Billed $60 a year")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Monthly" }))
    expect(screen.getByText("$6")).toBeInTheDocument()
    expect(screen.getByRole("table")).toBeInTheDocument()
  })

  it("renders security and validates the download form", async () => {
    const user = userEvent.setup()
    render(<PocketSecurity />)
    expect(screen.getByRole("heading", { name: "What happens when you lose your phone" })).toBeInTheDocument()
    cleanup()
    render(<PocketDownload />)
    await user.click(screen.getByRole("button", { name: "Text me the link" }))
    expect(screen.getByText("Enter a mobile number or an email address.")).toBeInTheDocument()
    await user.type(screen.getByLabelText("Mobile number or email"), "5550102030")
    await user.click(screen.getByRole("radio", { name: "Android" }))
    await user.click(screen.getByRole("button", { name: "Text me the link" }))
    expect(screen.getByText(/Sent to 5550102030. Open it on your Android./)).toBeInTheDocument()
  })
})
