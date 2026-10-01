// Ballmac UI: Launch changelog page. https://ui.ballmac.com/templates/template-launch
"use client"

import * as React from "react"

import { Changelog1 } from "@/components/ballmac/blocks/changelog-1/changelog-1"
import { LaunchShell, type LaunchHrefs } from "@/components/ballmac/templates/launch/launch-theme"

type LaunchChangelogProps = React.ComponentProps<"div"> & { hrefs?: Partial<LaunchHrefs> }

/** The Launch changelog page: Changelog1 with Beacon's releases. */
function LaunchChangelog({ hrefs, ...props }: LaunchChangelogProps) {
  return (
    <LaunchShell page="changelog" hrefs={hrefs} {...props}>
      <main>
        <Changelog1
          title="What’s new in Beacon"
          description="Every release, newest first. We ship something most weeks."
          initialCount={3}
          releases={[
            { version: "3.2.0", date: "2026-09-24", title: "Automatic rollbacks", summary: "Set an error or latency threshold and Beacon returns production to the last good build when a release crosses it.", cover: 0, changes: [{ type: "new", text: "Rollback rules per project, with Slack and email alerts" }, { type: "new", text: "A rollback timeline on every deployment" }, { type: "improved", text: "Rollbacks finish in a median of six seconds" }] },
            { version: "3.1.2", date: "2026-09-09", title: "Budgets for accessibility", summary: "Fail a pull request when its accessibility score drops below your ceiling.", cover: 1, changes: [{ type: "new", text: "Accessibility score as a budget" }, { type: "improved", text: "Budget failures link to the offending element" }, { type: "fixed", text: "Budgets no longer reset when a project is renamed" }] },
            { version: "3.1.0", date: "2026-08-20", title: "Comments pinned to the page", changes: [{ type: "new", text: "Pin a comment to any element on a preview" }, { type: "improved", text: "Reviewers outside your team can comment without an account" }] },
            { version: "3.0.4", date: "2026-08-02", title: "Faster monorepo builds", changes: [{ type: "improved", text: "Builds skip packages that did not change" }, { type: "fixed", text: "Cached dependencies are no longer invalidated by lockfile whitespace" }] },
            { version: "3.0.0", date: "2026-06-18", title: "Beacon 3", summary: "A new dashboard, regions and a rebuilt build pipeline.", cover: 2, changes: [{ type: "new", text: "Choose where builds run: Frankfurt, Virginia or Singapore" }, { type: "improved", text: "A new dashboard that loads in under a second" }, { type: "fixed", text: "Fifteen long-standing bugs in the Git integration" }] },
          ]}
        />
      </main>
    </LaunchShell>
  )
}

export { LaunchChangelog, type LaunchChangelogProps }
