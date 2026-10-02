# Pro batch 4: dashboards and app screens (25)

Looked at (not copied): Tremor blocks (Apache-2.0, patterns only), shadcn dashboard examples (MIT), Magic UI and DaisyUI dashboards, plus paid kits for layout ideas only. No code was taken from paid or unlicensed kits.

**Part A: dashboards 1 to 12** (`dashboard-pro-1…12`): revenue, recurring revenue and cohorts, funnel, live traffic, cash flow, store pulse heatmap, campaigns table, project health and burndown, infrastructure, sales pipeline and quota gauge, support, morning brief. Shared pieces live in `dashboard-kit` (`DashHeader`, `Panel`, `Legend`, `wave`).

**Part B: app screens**
| Block | Question it answers |
|---|---|
| app-shell-pro-1 | Where am I and where can I go? Icon rail plus second-level panel |
| app-shell-pro-2 | Same, with a top bar, search, tabs and menus |
| mail-pro-1 | Can I triage fast? J/K/E/S/#/U/Z keys, undo, focus follows |
| calendar-pro-1 | Who is free when? Resource timeline, hold and release slots |
| kanban-pro-1 | Is anyone overloaded? Swimlanes, WIP limits, drag or Move select |
| settings-pro-1 | Which alerts, where? Notification matrix, quiet hours, save bar |
| settings-pro-2 | Is my account safe? Two-step setup, sessions, API tokens |
| billing-pro-1 | What am I using? Plan, meters with warning, card, invoices |
| ai-chat-pro-1 | Chat with sources, tool chips and an artifact panel |
| dashboard-pro-13 | Data table with filters, sorting, bulk bar, details |
| dashboard-pro-14 | Storage usage, drop zone, recent files |
| dashboard-pro-15 | Activation checklist with a progress ring |
| dashboard-pro-16 | Activity feed with filters and presence |

**Decisions**
- Every number is sample data; limits, thresholds (`warnAt`) and the demo two-step code are props.
- Every drag interaction has a keyboard or select equivalent (kanban Move select, calendar arrow-key slots).
- Removing the focused item moves focus to the next one (mail archive).
- Scrollable regions are focusable with a label.

**Lessons**
- Removing the focused row loses keyboard focus unless you move it yourself.
- Coloured small text fails contrast; colour icons and fills, keep text in foreground tokens.
- `dl` children must be `dt`/`dd` only.
