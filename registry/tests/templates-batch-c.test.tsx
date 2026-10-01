import * as React from "react"
import { act, cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { PodcastEpisode } from "@/components/ballmac/templates/podcast/podcast-episode"
import { PodcastEpisodes } from "@/components/ballmac/templates/podcast/podcast-episodes"
import { PodcastHome } from "@/components/ballmac/templates/podcast/podcast-home"
import { PodcastHosts } from "@/components/ballmac/templates/podcast/podcast-hosts"
import { PodcastSubscribe } from "@/components/ballmac/templates/podcast/podcast-subscribe"
import { PortfolioCase } from "@/components/ballmac/templates/portfolio/portfolio-case"
import { PortfolioHome } from "@/components/ballmac/templates/portfolio/portfolio-home"
import { PortfolioUses } from "@/components/ballmac/templates/portfolio/portfolio-uses"
import { PortfolioWork } from "@/components/ballmac/templates/portfolio/portfolio-work"
import { PortfolioWriting } from "@/components/ballmac/templates/portfolio/portfolio-writing"
import { PublicationArticle } from "@/components/ballmac/templates/publication/publication-article"
import { PublicationAuthor } from "@/components/ballmac/templates/publication/publication-author"
import { PublicationHome } from "@/components/ballmac/templates/publication/publication-home"
import { PublicationIssues } from "@/components/ballmac/templates/publication/publication-issues"
import { PublicationSection } from "@/components/ballmac/templates/publication/publication-section"
import { StudioContact } from "@/components/ballmac/templates/studio/studio-contact"
import { StudioHome } from "@/components/ballmac/templates/studio/studio-home"
import { StudioProject } from "@/components/ballmac/templates/studio/studio-project"
import { StudioServices } from "@/components/ballmac/templates/studio/studio-services"
import { StudioWork } from "@/components/ballmac/templates/studio/studio-work"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})
afterEach(() => vi.useRealTimers())

describe("Portfolio", () => {
  it("shows the project result for screen readers and filters the work page", async () => {
    const user = userEvent.setup()
    render(<PortfolioHome />)
    expect(screen.getAllByText(/^Result: /).length).toBe(4)
    expect(within(screen.getByRole("navigation", { name: "Main" })).getByRole("link", { name: "Work" })).not.toHaveAttribute("aria-current")
    cleanup()
    render(<PortfolioWork />)
    await user.click(screen.getByRole("button", { name: /^Systems/ }))
    expect(screen.getByText("2 projects shown")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^All/ }))
    expect(screen.getByText("6 projects shown")).toBeInTheDocument()
  })

  it("filters and searches the writing page", async () => {
    const user = userEvent.setup()
    render(<PortfolioWriting />)
    await user.click(screen.getByRole("button", { name: "Career" }))
    expect(screen.getByText("1 posts")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "All" }))
    await user.type(screen.getByRole("searchbox", { name: "Search posts" }), "zzzz")
    expect(screen.getByText(/No posts match/)).toBeInTheDocument()
  })

  it("renders the case study with a contents list and the uses page", () => {
    render(<PortfolioCase />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Rebuilding onboarding")
    expect(screen.getByRole("navigation", { name: "On this page" })).toBeInTheDocument()
    cleanup()
    render(<PortfolioUses />)
    expect(screen.getByRole("heading", { name: "Hardware" })).toBeInTheDocument()
  })
})

describe("Studio", () => {
  it("shows the poster for a hovered or focused row", async () => {
    const user = userEvent.setup()
    render(<StudioHome />)
    const row = screen.getByRole("link", { name: /Oat & Ember/ })
    await user.hover(row)
    expect(screen.getByText("A launch that sold out in nine days.")).toBeInTheDocument()
    await user.unhover(row)
    expect(screen.queryByText("A launch that sold out in nine days.")).not.toBeInTheDocument()
    act(() => row.focus())
    expect(screen.getByText("A launch that sold out in nine days.")).toBeInTheDocument()
  })

  it("filters work and switches to the table", async () => {
    const user = userEvent.setup()
    render(<StudioWork />)
    await user.click(screen.getByRole("button", { name: "Digital" }))
    expect(screen.getByText("2 projects shown")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "List view" }))
    expect(screen.getByRole("table", { name: "All projects" })).toBeInTheDocument()
  })

  it("opens and closes services and validates the brief", async () => {
    const user = userEvent.setup()
    render(<StudioServices />)
    const first = screen.getByRole("button", { name: /Brand identity/ })
    expect(first).toHaveAttribute("aria-expanded", "true")
    await user.click(screen.getByRole("button", { name: /Digital design/ }))
    expect(first).toHaveAttribute("aria-expanded", "false")
    cleanup()
    render(<StudioContact />)
    await user.click(screen.getByRole("button", { name: "Send the brief" }))
    expect(screen.getByText("Your name, please.")).toBeInTheDocument()
    expect(screen.getByLabelText("Name")).toHaveFocus()
    await user.type(screen.getByLabelText("Name"), "Ada Lovelace")
    await user.type(screen.getByLabelText("Email"), "ada@acme.co")
    await user.type(screen.getByLabelText("The brief"), "We need a brand that moves people and a site to match.")
    await user.click(screen.getByRole("button", { name: "Send the brief" }))
    expect(screen.getByText("Thanks, Ada.")).toBeInTheDocument()
  })

  it("renders a project page", () => {
    render(<StudioProject />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("North Coast Rail")
  })
})

describe("Publication", () => {
  it("validates the newsletter signup", async () => {
    const user = userEvent.setup()
    render(<PublicationHome />)
    await user.click(screen.getByRole("button", { name: "Sign me up" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Enter an email")
    await user.type(screen.getByLabelText("Email address"), "ada@acme.co")
    await user.click(screen.getByRole("button", { name: "Sign me up" }))
    expect(screen.getByRole("status")).toHaveTextContent("You’re on the list")
  })

  it("links margin notes to their text and exposes the progress bar", () => {
    render(<PublicationArticle />)
    expect(screen.getAllByRole("complementary", { name: /^Note \d$/ })).toHaveLength(3)
    expect(screen.getByRole("link", { name: "Note 2" })).toHaveAttribute("href", "#note-2")
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("unfinished city")
  })

  it("filters a section, sorts it and loads more", async () => {
    const user = userEvent.setup()
    render(<PublicationSection initial="All" />)
    expect(screen.getByRole("status")).toHaveTextContent("Showing 4 of 10")
    await user.click(screen.getByRole("button", { name: "Load more stories" }))
    expect(screen.getByRole("status")).toHaveTextContent("Showing 8 of 10")
    await user.click(screen.getByRole("button", { name: "Science" }))
    expect(screen.getByRole("status")).toHaveTextContent("Showing 2 of 2")
    expect(screen.queryByRole("button", { name: "Load more stories" })).not.toBeInTheDocument()
  })

  it("renders the author and issues pages and switches billing", async () => {
    const user = userEvent.setup()
    render(<PublicationAuthor />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Inês Marques")
    cleanup()
    render(<PublicationIssues />)
    expect(screen.getByText("$40")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Monthly" }))
    expect(screen.getByText("$4")).toBeInTheDocument()
  })
})

describe("Podcast", () => {
  it("opens the mini player from a play button", async () => {
    const user = userEvent.setup()
    render(<PodcastHome />)
    expect(screen.queryByRole("region", { name: "Now playing" })).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Play episode 41/ }))
    const player = screen.getByRole("region", { name: "Now playing" })
    expect(within(player).getByText("41. Bread and Patience")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Close the player" }))
    expect(screen.queryByRole("region", { name: "Now playing" })).not.toBeInTheDocument()
  })

  it("validates the show-notes signup", async () => {
    const user = userEvent.setup()
    render(<PodcastHome />)
    await user.click(screen.getByRole("button", { name: "Send me show notes" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Enter an email")
  })

  it("searches and filters episodes", async () => {
    const user = userEvent.setup()
    render(<PodcastEpisodes />)
    await user.click(screen.getByRole("button", { name: "Season 2" }))
    expect(screen.getByRole("status")).toHaveTextContent("3 episodes")
    await user.type(screen.getByRole("searchbox", { name: "Search episodes" }), "zzzz")
    expect(screen.getByText("No episodes found")).toBeInTheDocument()
  })

  it("seeks from the transcript and highlights search matches", async () => {
    const user = userEvent.setup()
    render(<PodcastEpisode />)
    expect(screen.getByRole("slider", { name: "Seek" })).toHaveAttribute("aria-valuenow", "0")
    await user.click(screen.getByRole("button", { name: /Everything\. Sleep, steps/ }))
    expect(screen.getByRole("slider", { name: "Seek" })).toHaveAttribute("aria-valuenow", "76")
    expect(screen.getByRole("button", { name: /Everything\. Sleep, steps/ })).toHaveAttribute("aria-current", "true")
    await user.type(screen.getByRole("searchbox", { name: "Search the transcript" }), "streak")
    expect(screen.getByRole("status")).toHaveTextContent("3 matches")
    await user.click(screen.getByRole("button", { name: /Why we stopped measuring/ }))
    expect(screen.getByRole("slider", { name: "Seek" })).toHaveAttribute("aria-valuenow", "95")
  })

  it("renders hosts and subscribe with a selectable support tier", async () => {
    const user = userEvent.setup()
    render(<PodcastHosts />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Meet the hosts")
    cleanup()
    render(<PodcastSubscribe />)
    expect(screen.getAllByRole("radio")[1]).toBeChecked()
    await user.click(screen.getAllByRole("radio")[2])
    expect(screen.getByRole("link", { name: /Support at \$25 a month/ })).toBeInTheDocument()
  })
})
