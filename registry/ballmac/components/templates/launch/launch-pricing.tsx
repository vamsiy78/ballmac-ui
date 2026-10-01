// Ballmac UI: Launch pricing page. https://ui.ballmac.com/templates/template-launch
"use client"

import * as React from "react"

import { Faq2 } from "@/components/ballmac/blocks/faq-2/faq-2"
import { Pricing2 } from "@/components/ballmac/blocks/pricing-2/pricing-2"
import { Pricing3 } from "@/components/ballmac/blocks/pricing-3/pricing-3"
import { LaunchShell, type LaunchHrefs } from "@/components/ballmac/templates/launch/launch-theme"

type LaunchPricingProps = React.ComponentProps<"div"> & { hrefs?: Partial<LaunchHrefs> }

/** The Launch pricing page: Pricing2 (plans with a yearly switch), Pricing3 (full comparison) and Faq2. */
function LaunchPricing({ hrefs, ...props }: LaunchPricingProps) {
  const link = { contact: "/launch/contact", ...hrefs }
  return (
    <LaunchShell page="pricing" hrefs={hrefs} {...props}>
      <main>
        <Pricing2
          title="Pay for the team you have."
          description="Start free. Upgrade when your team grows. Every plan includes unlimited previews."
          plans={[
            { name: "Hobby", description: "For side projects and learning.", price: { monthly: 0, yearly: 0 }, unit: "free forever", features: ["3 projects", "Unlimited previews", "Community support", "7 days of history"], cta: { label: "Start free", href: link.contact } },
            { name: "Team", description: "For product teams who ship weekly.", price: { monthly: 24, yearly: 19 }, unit: "per seat", lead: "Everything in Hobby, plus:", features: ["Unlimited projects", "Performance budgets", "Automatic rollbacks", "90 days of history", "Slack alerts"], cta: { label: "Start a 14-day trial", href: link.contact }, featured: true },
            { name: "Company", description: "For organisations with compliance needs.", price: "Custom", lead: "Everything in Team, plus:", features: ["SSO and SCIM", "Audit log export", "Private networking", "Dedicated support", "Custom retention"], cta: { label: "Talk to sales", href: link.contact } },
          ]}
        />
        <Pricing3
          title="Compare every feature"
          description="The details, side by side."
          stickyOffset={64}
          plans={[
            { key: "hobby", name: "Hobby", price: "$0", period: "free forever", cta: { label: "Start free", href: link.contact } },
            { key: "team", name: "Team", price: "$24", period: "per seat / month", cta: { label: "Start trial", href: link.contact }, featured: true },
            { key: "company", name: "Company", price: "Custom", period: "talk to us", cta: { label: "Talk to sales", href: link.contact } },
          ]}
          groups={[
            { title: "Deploys", rows: [
              { label: "Preview deployments", values: { hobby: "Unlimited", team: "Unlimited", company: "Unlimited" } },
              { label: "Concurrent builds", hint: "Builds that can run at the same time", values: { hobby: "1", team: "10", company: "50" } },
              { label: "Build history", values: { hobby: "7 days", team: "90 days", company: "Custom" } },
            ] },
            { title: "Safety", rows: [
              { label: "Performance budgets", values: { hobby: false, team: true, company: true } },
              { label: "Automatic rollbacks", values: { hobby: false, team: true, company: true } },
              { label: "Audit log export", values: { hobby: false, team: false, company: true } },
            ] },
            { title: "Support", rows: [
              { label: "Slack and email alerts", values: { hobby: false, team: true, company: true } },
              { label: "SSO and SCIM", values: { hobby: false, team: false, company: true } },
              { label: "Support", values: { hobby: "Community", team: "Email, 1 day", company: "Dedicated, 1 hour" } },
            ] },
          ]}
        />
        <Faq2
          title="Pricing questions"
          description="Still unsure? These are the ones we hear most."
          support={{ label: "Contact support", href: link.contact, text: "Not here? A human replies within a working day." }}
          categories={[
            { name: "Billing", questions: [
              { question: "Can I change plans later?", answer: "Yes. Upgrade or downgrade at any time. We prorate the difference, so you only pay for what you use." },
              { question: "How do seats work?", answer: "You pay for people who can deploy. Viewers who only comment on previews are always free." },
              { question: "Do you offer discounts?", answer: "Open source projects and students get Team free. Annual billing saves about 20%." },
            ] },
            { name: "Product", questions: [
              { question: "What counts as a preview?", answer: "Every branch or pull request build. There is no limit on how many you create." },
              { question: "How do rollbacks decide?", answer: "You set thresholds for error rate and latency. If a release crosses one, Beacon restores the last good build." },
            ] },
            { name: "Security", questions: [
              { question: "Where is my code stored?", answer: "Builds run in isolated, short-lived containers in the region you choose. Source is never kept after the build." },
            ] },
          ]}
        />
      </main>
    </LaunchShell>
  )
}

export { LaunchPricing, type LaunchPricingProps }
