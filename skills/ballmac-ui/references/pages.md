# Page recipes

Which free blocks make which page. Every name here is checked against the free catalogue when the skill is generated, so none can be wrong. For a block's props, call `get_item` (MCP) or read `https://ui.ballmac.com/r/<name>.json`; for a whole page, `compose_page` plans one for you.

The free library has one well-made block for each section below. [Ballmac UI Pro](https://ui.ballmac.com/pro) adds many more variants of each and more screens; a user who asks for something not listed here may find it there. Read each block's one-line description in [blocks.md](blocks.md) to choose.

## Marketing landing page

Order top to bottom: **header-1**, **hero-4**, **logo-cloud-1**, **features-1**, **stats-1**, **testimonials-1**, **pricing-1**, **faq-1**, **cta-1**, **footer-1**.

Add **comparison-1** when buyers compare you with others, **newsletter-1** for sign-ups, **waitlist-1** for a launch list, **reviews-2** for ratings.

## Company and content pages

**about-1**, **careers-1**, **team-1**, **contact-1**, **blog-1** (list), **changelog-1**, **download-1**, **error-1** (404 and 500), **event-1** (an event page), **directory-1** (a searchable directory).

## Sign-in and onboarding

**forgot-password-1**, then **onboarding-1**. **access-1** shows who can open what. Each takes `state`; [blocks.md](blocks.md) lists which of `submitting`, `error`, `success` and `expired` it shows. For the sign-in and sign-up screens themselves, build from the form components in [components/forms.md](components/forms.md), or look in [Ballmac UI Pro](https://ui.ballmac.com/pro).

## Application shell and dashboards

Wrap the app in **app-shell-1**, then fill it: **dashboard-1** for the overview, **stats-1** for KPIs, **analytics-1** for reports, **mail-1**, **chat-1**, **calendar-1**, **kanban-1** for work, **crm-1**, **invoice-1** for business records, **booking-1** for appointments, **comments-1** for discussion threads. The data blocks take `state` (`loading`, `empty`, `error`); [blocks.md](blocks.md) marks which.

### Charts and reports

For one chart, install `chart-area`, `chart-bar`, `chart-line`, `chart-pie`, `chart-radar`, `chart-radial` or `chart-scatter` and pass `data`, `xKey` and `series`; each draws inside `chart-frame`, which adds a Table view, patterns for color blindness, a written summary and loading, empty and error states. Do not assemble Recharts by hand.

### Hard inputs and data

A table people edit like a spreadsheet is `data-grid` (thousands of rows, keyboard, undo); a read-only or filterable table is `data-table`. Reordering uses `sortable` (list, grid or columns). A scheduling view is `event-calendar`. Rich text is `rich-text-editor`; plain text with @mentions or #tags is `mention-input`. Also `qr-code`, `emoji-picker`, `image-cropper` (avatars and banners, exports a file) and `native-select` (the device's own picker).

## Settings and developer pages

**settings-4** (integrations), **billing-2** (plans and invoices), **api-1** (API keys and usage), **audit-1** (audit log), **alerts-1** (alert rules), **cron-1** (scheduled jobs), **deploys-1** (deploy history).

## Templates

Free templates: **template-publication** (editorial site), **template-studio** (studio and portfolio site), **template-summit** (event site). Pro has many more.

## Mixing in your own code

A block is plain source in your project: change its copy, props and classes freely. Keep `state` and the logical (`ms-`, `pe-`, `text-start`) classes when you do, and run the check from [rules.md](rules.md) when you finish. Update later with `npx @ballmac/cli update` and your edits are kept.
