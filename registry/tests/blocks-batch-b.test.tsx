import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Blog1, BlogCover } from "@/components/ballmac/blocks/blog-1/blog-1"
import { BlogPost1 } from "@/components/ballmac/blocks/blog-post-1/blog-post-1"
import { Careers1 } from "@/components/ballmac/blocks/careers-1/careers-1"
import { Changelog1 } from "@/components/ballmac/blocks/changelog-1/changelog-1"
import { Comparison1 } from "@/components/ballmac/blocks/comparison-1/comparison-1"
import { Contact1 } from "@/components/ballmac/blocks/contact-1/contact-1"
import { Error1 } from "@/components/ballmac/blocks/error-1/error-1"
import { Newsletter1 } from "@/components/ballmac/blocks/newsletter-1/newsletter-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Blog1", () => {
  it("features the first post and lists the rest with UTC dates", () => {
    render(<Blog1 />)
    expect(screen.getAllByRole("article")).toHaveLength(7)
    expect(screen.getByRole("link", { name: /How we cut month-end close/ })).toBeInTheDocument()
    expect(screen.getAllByText("Sep 24, 2026").length).toBeGreaterThan(0)
  })

  it("filters by topic and announces the count", async () => {
    const user = userEvent.setup()
    render(<Blog1 />)
    await user.click(screen.getByRole("button", { name: "Engineering" }))
    expect(screen.getByRole("button", { name: "Engineering" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getAllByRole("article")).toHaveLength(2)
    expect(screen.getByRole("status")).toHaveTextContent("2 posts shown")
  })

  it("uses a photo when given one and draws a decorative cover otherwise", () => {
    const { container } = render(
      <Blog1 filterable={false} posts={[{ title: "A", excerpt: "x", category: "c", date: "2026-01-02", readMinutes: 1, author: "Me", href: "#", image: "/a.png" }]} />
    )
    expect(container.querySelector("img")).toHaveAttribute("src", "/a.png")
    const { container: c2 } = render(<BlogCover variant={7} />)
    expect(c2.firstChild).toHaveAttribute("aria-hidden", "true")
  })
})

describe("BlogPost1", () => {
  it("renders the article, breadcrumb, contents and author card", () => {
    render(<BlogPost1 />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("month-end close")
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: "On this page" })).toBeInTheDocument()
    expect(screen.getByRole("complementary", { name: "About the author" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Copy link/ })).toBeInTheDocument()
  })

  it("accepts your own body and hides related posts and contents", () => {
    render(<BlogPost1 toc={[]} related={[]}><h2 id="x">Hello</h2><p>World</p></BlogPost1>)
    expect(screen.getByRole("heading", { level: 2, name: "Hello" })).toBeInTheDocument()
    expect(screen.queryByRole("navigation", { name: "On this page" })).not.toBeInTheDocument()
    expect(screen.queryByText("Keep reading")).not.toBeInTheDocument()
  })
})

describe("Changelog1", () => {
  it("shows the first three releases and expands the rest", async () => {
    const user = userEvent.setup()
    render(<Changelog1 />)
    expect(screen.getAllByRole("article")).toHaveLength(3)
    await user.click(screen.getByRole("button", { name: /Show 2 older releases/ }))
    expect(screen.getAllByRole("article")).toHaveLength(5)
  })

  it("filters changes by type and drops releases without any", async () => {
    const user = userEvent.setup()
    render(<Changelog1 />)
    await user.click(screen.getByRole("button", { name: /^Fixed/ }))
    expect(screen.getByRole("button", { name: /^Fixed/ })).toHaveAttribute("aria-pressed", "true")
    expect(screen.queryByText("Approve or reject from Slack with one tap")).not.toBeInTheDocument()
    expect(screen.getByText(/Approvers added mid-flow/)).toBeInTheDocument()
  })

  it("hides the feed button when null", () => {
    render(<Changelog1 feed={null} />)
    expect(screen.queryByRole("link", { name: /RSS/ })).not.toBeInTheDocument()
  })
})

describe("Contact1", () => {
  it("shows validation errors, focuses the first invalid field and does not submit", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Contact1 onSubmit={onSubmit} />)
    await user.click(screen.getByRole("button", { name: /Send message/ }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText("Tell us your name.")).toBeInTheDocument()
    expect(screen.getByText(/full email address/)).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: /Name/ })).toHaveFocus()
    expect(screen.getByRole("textbox", { name: /Name/ })).toHaveAttribute("aria-invalid", "true")
  })

  it("submits valid values and shows the thank-you screen, which can be reset", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<Contact1 topics={[]} onSubmit={onSubmit} />)
    await user.type(screen.getByRole("textbox", { name: /Name/ }), "Jordan Lee")
    await user.type(screen.getByRole("textbox", { name: /Email/ }), "jordan@acme.com")
    await user.type(screen.getByRole("textbox", { name: /Message/ }), "Hello, I have a question about pricing.")
    await user.click(screen.getByRole("checkbox"))
    await user.click(screen.getByRole("button", { name: /Send message/ }))
    await waitFor(() => expect(screen.getByText("Message sent")).toBeInTheDocument())
    expect(onSubmit).toHaveBeenCalledWith({ name: "Jordan Lee", email: "jordan@acme.com", topic: "", message: "Hello, I have a question about pricing." })
    await user.click(screen.getByRole("button", { name: "Send another message" }))
    expect(screen.getByRole("textbox", { name: /Name/ })).toHaveValue("")
  })

  it("shows an error when onSubmit throws", async () => {
    const user = userEvent.setup()
    render(<Contact1 topics={[]} onSubmit={() => Promise.reject(new Error("no"))} />)
    await user.type(screen.getByRole("textbox", { name: /Name/ }), "A B")
    await user.type(screen.getByRole("textbox", { name: /Email/ }), "a@b.co")
    await user.type(screen.getByRole("textbox", { name: /Message/ }), "A long enough message.")
    await user.click(screen.getByRole("checkbox"))
    await user.click(screen.getByRole("button", { name: /Send message/ }))
    expect(await screen.findByText(/Something went wrong/)).toBeInTheDocument()
  })

  it("counts characters", async () => {
    const user = userEvent.setup()
    render(<Contact1 maxLength={50} />)
    await user.type(screen.getByRole("textbox", { name: /Message/ }), "hello")
    expect(screen.getByText("5/50")).toBeInTheDocument()
  })
})

describe("Careers1", () => {
  it("groups roles by team", () => {
    render(<Careers1 />)
    expect(screen.getByRole("heading", { level: 3, name: /Engineering/ })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Senior Backend Engineer/ })).toBeInTheDocument()
  })

  it("filters by team and by search, with an empty state", async () => {
    const user = userEvent.setup()
    render(<Careers1 />)
    await user.click(screen.getByRole("button", { name: "Design" }))
    expect(screen.queryByRole("link", { name: /Senior Backend Engineer/ })).not.toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("2 open roles")
    await user.click(screen.getByRole("button", { name: "All" }))
    await user.type(screen.getByRole("searchbox", { name: "Search roles" }), "lisbon")
    expect(screen.getByRole("status")).toHaveTextContent("2 open roles")
    await user.clear(screen.getByRole("searchbox"))
    await user.type(screen.getByRole("searchbox"), "zzz")
    expect(screen.getByText("No open roles match")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Reset filters" }))
    expect(screen.getByRole("status")).toHaveTextContent("8 open roles")
  })

  it("can hide the perks", () => {
    render(<Careers1 perks={[]} openApplication={null} />)
    expect(screen.queryByText("Remote-first")).not.toBeInTheDocument()
    expect(screen.queryByText(/open application/)).not.toBeInTheDocument()
  })
})

describe("Comparison1", () => {
  it("reads every cell as text for screen readers", () => {
    render(<Comparison1 />)
    const table = screen.getByRole("table")
    expect(within(table).getByText("Acme, Real-time collaboration: yes")).toBeInTheDocument()
    expect(within(table).getByText("Spreadsheets, Real-time collaboration: partly")).toBeInTheDocument()
    expect(within(table).getByText("Legacy suite, Real-time collaboration: no")).toBeInTheDocument()
    expect(within(table).getByText("$250 / mo")).toBeInTheDocument()
  })

  it("switches the alternative on phones", async () => {
    const user = userEvent.setup()
    render(<Comparison1 />)
    expect(screen.getByRole("radio", { name: "Spreadsheets" })).toHaveAttribute("aria-checked", "true")
    await user.click(screen.getByRole("radio", { name: "Legacy suite" }))
    expect(screen.getByRole("radio", { name: "Legacy suite" })).toHaveAttribute("aria-checked", "true")
  })

  it("hides the reasons when empty", () => {
    render(<Comparison1 reasons={[]} />)
    expect(screen.queryByText("faster month-end close")).not.toBeInTheDocument()
  })
})

describe("Newsletter1", () => {
  it("toggles topics", async () => {
    const user = userEvent.setup()
    render(<Newsletter1 />)
    expect(screen.getByRole("button", { name: "Product updates" })).toHaveAttribute("aria-pressed", "true")
    await user.click(screen.getByRole("button", { name: "Design" }))
    expect(screen.getByRole("button", { name: "Design" })).toHaveAttribute("aria-pressed", "true")
  })

  it("rejects a bad address with an announced error", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Newsletter1 onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText("Email address"), "nope")
    await user.click(screen.getByRole("button", { name: /Subscribe/ }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole("alert")).toHaveTextContent("full email address")
    expect(screen.getByLabelText("Email address")).toHaveAttribute("aria-invalid", "true")
  })

  it("submits the email and topics, then confirms", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<Newsletter1 onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText("Email address"), "me@acme.com")
    await user.click(screen.getByRole("button", { name: /Subscribe/ }))
    await waitFor(() => expect(screen.getByText("You’re subscribed.")).toBeInTheDocument())
    expect(onSubmit).toHaveBeenCalledWith("me@acme.com", ["Product updates"])
  })

  it("shows the error state when submitting fails", async () => {
    const user = userEvent.setup()
    render(<Newsletter1 topics={[]} onSubmit={() => Promise.reject(new Error("x"))} />)
    await user.type(screen.getByLabelText("Email address"), "me@acme.com")
    await user.click(screen.getByRole("button", { name: /Subscribe/ }))
    expect(await screen.findByText(/couldn’t subscribe/)).toBeInTheDocument()
  })
})

describe("Error1", () => {
  it("names the error for screen readers and keeps the numerals decorative", () => {
    const { container } = render(<Error1 />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Error 404: This page took a wrong turn.")
    expect(container.querySelector("p[aria-hidden=true]")).toHaveTextContent("44")
  })

  it("has copy for each status and an optional reference", () => {
    const { rerender } = render(<Error1 status="500" reference="req_1" />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Something broke on our side.")
    expect(screen.getByText("Reference: req_1")).toBeInTheDocument()
    rerender(<Error1 status="403" />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("don’t have access")
  })

  it("searches on Enter and goes back", async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    const back = vi.spyOn(window.history, "back").mockImplementation(() => {})
    render(<Error1 onSearch={onSearch} />)
    await user.type(screen.getByRole("searchbox", { name: "Search the site" }), "pricing{Enter}")
    expect(onSearch).toHaveBeenCalledWith("pricing")
    await user.click(screen.getByRole("button", { name: "Go back" }))
    expect(back).toHaveBeenCalled()
  })

  it("can hide search and links", () => {
    render(<Error1 search={false} links={[]} />)
    expect(screen.queryByRole("search")).not.toBeInTheDocument()
    expect(screen.queryByText("Documentation")).not.toBeInTheDocument()
  })
})
