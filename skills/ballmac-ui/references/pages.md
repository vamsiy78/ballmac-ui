# Page recipes

Which blocks make which page. Every name here is checked against the catalogue when the skill is generated, so none can be wrong. For a block's props, call `get_item` (MCP) or read `https://ui.ballmac.com/r/<name>.json`; for a whole page, `compose_page` plans one for you.

Pick one variant of each section (`hero-1` to `hero-7` are alternatives, not a stack). Read each block's one-line description in [blocks.md](blocks.md) to choose.

## Marketing landing page

Order top to bottom: **header-1** or **header-2**, a hero (**hero-1** to **hero-7**), **logo-cloud-1**, features (**features-1** to **features-7**), **stats-1**, **testimonials-1** or **testimonials-2**, **pricing-1** to **pricing-4**, **faq-1** or **faq-2**, **cta-1** to **cta-3**, **footer-1** or **footer-2**.

Add **comparison-1** when buyers compare you with others, **integrations-1** for an integrations grid, **casestudy-1** for customer stories, **newsletter-1** for sign-ups, **trust-1** for security and compliance.

## Company and content pages

**about-1**, **careers-1**, **team-1**, **contact-1**, **blog-1** (list) with **blog-post-1** (article), **changelog-1**, **help-1** (help centre), **status-1** (status page), **download-1**, **error-1** (404 and 500).

## Sign-in and onboarding

**login-1** or **login-2**, **signup-1**, **forgot-password-1**, **verify-1** (one-time code), then **onboarding-1** and **invite-1**. Each takes `state`; [blocks.md](blocks.md) lists which of `submitting`, `error`, `success` and `expired` it shows. For a complete, switchable set use the **template-auth-kit** template.

## Application shell and dashboards

Wrap the app in **app-shell-1**, then fill it: **dashboard-1** or **dashboard-2** for the overview, **stats-1** for KPIs, **funnel-1**, **retention-1**, **experiments-1** for analytics, **mail-1**, **chat-1**, **calendar-1**, **kanban-1**, **tasks-1**, **gantt-1** for work, **crm-1**, **inventory-1**, **invoice-1**, **expenses-1**, **timesheet-1** for business records. The data blocks take `state` (`loading`, `empty`, `error`); [blocks.md](blocks.md) marks which.

For a ready-made admin use **template-atlas** or **template-workspace**.

### Charts and reports

For a page of charts, start from **charts-1** (analytics overview), **charts-2** (revenue report), **charts-3** (small multiples) or **charts-4** (scorecard). For one chart, install `chart-area`, `chart-bar`, `chart-line`, `chart-pie`, `chart-radar`, `chart-radial` or `chart-scatter` and pass `data`, `xKey` and `series`; each draws inside `chart-frame`, which adds a Table view, patterns for color blindness, a written summary and loading, empty and error states. Do not assemble Recharts by hand.

### Hard inputs and data

A table people edit like a spreadsheet is `data-grid` (thousands of rows, keyboard, undo); a read-only or filterable table is `data-table`. Reordering uses `sortable` (list, grid or columns). A scheduling view is `event-calendar`. Rich text is `rich-text-editor`; plain text with @mentions or #tags is `mention-input`. Also `qr-code`, `emoji-picker`, `image-cropper` (avatars and banners, exports a file) and `native-select` (the device's own picker).

## Settings

**settings-1** (account), **settings-2** (notifications), **settings-3** (team members), **settings-4** (integrations), **settings-5** (audit log), **settings-6** (data and privacy). **billing-1** and **billing-2** for plans and invoices. **webhooks-1**, **flags-1**, **api-1**, **dev-1** for developer settings.

## AI product

**ai-chat-1** and **ai-chat-2** for a chat; the agent set for anything that acts: **agent-1** (live run), **agent-2** (approvals inbox), **agent-3** (runs and traces), **agent-4** (prompt playground), **agent-5** (eval results), **agent-6** (assistant memory), **agent-7** (agent builder), **agent-8** (knowledge manager). **workflow-1** is an automation builder.

## Desktop app (Tauri, Electron)

**desktop-1** (preferences), **desktop-2** (menu bar and tray), **desktop-3** (software update), **desktop-4** (licence), **desktop-5** (permissions), **desktop-6** (About), **desktop-7** (welcome window), **desktop-8** (shortcuts editor). Pair with the macOS feel (`npx shadcn@latest add @ballmac/feel-macos`) and the window components in [components/macos.md](components/macos.md).

## Community and learning

**comments-1**, **poll-1**, **leaderboard-1**, **reviews-1**, **survey-1**, **quiz-1**, **course-1**, **waitlist-1**, **event-1**, **tour-1** (guided product tour).

## Maps, places and planning

**locations-1** (store finder on a dotted map), **trip-1**, **seatmap-1**, **roster-1**, **recipe-1**, **habits-1**, **portfolio-1**, **goals-1**, **orgchart-1**, **directory-1**.

## Mixing in your own code

A block is plain source in your project: change its copy, props and classes freely. Keep `state` and the logical (`ms-`, `pe-`, `text-start`) classes when you do, and run the check from [rules.md](rules.md) when you finish. Update later with `npx @ballmac/cli update` and your edits are kept.
