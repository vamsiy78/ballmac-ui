# Pro starter 2: Quire, an AI assistant that shows its sources

Written 2026-10-04. Nothing here copies code from another starter: the pieces are the AI SDK (Apache-2.0), Better Auth, Drizzle, Stripe's SDK, React Email and Resend, react-markdown (MIT), all used through their public APIs, plus Ballmac UI.

## What exists, and where it falls short

- **Vercel `ai-chatbot`** (the reference template): Next.js, AI SDK, shadcn/ui, Postgres, Auth.js. A solid chat shell. It has no workspaces or teams, no billing, no usage limits, no knowledge of your own documents, and the look is the stock shadcn chat: bubbles, a sidebar, a spinner.
- **assistant-ui, LibreChat, Open WebUI**: strong chat engines or self-hosted products. They are libraries or applications, not a starter you own and rebrand: little on sign-up, plans, seats or an API for your own customers.
- **Pattern in most chat UIs** (consistent across current UX write-ups): input at the bottom, bubbles above, a spinner between. The advice that keeps coming up is the opposite: never ship a blank box (suggested prompts), show a stop control while streaming, and attach sources to factual claims as numbered citations that expand to the passage.

So the gap is not "another chat box". It is a product around the chat: teams, plans and limits, your own documents, and answers you can check.

## Position

**Quire answers from your team's documents and shows where each answer came from.** That is the one idea the whole design serves, and it is useful to the buyer: it is the feature that makes a workspace assistant trustworthy, and it is what a buyer's customers will ask for first.

## What it includes

Everything Beacon has (sign-in, workspaces, roles, invitations, Stripe plans and portal, API keys, activity log, emails, tests), with the "projects" sample replaced by:

- **Conversations** per person, saved, searchable, grouped by day.
- **Library**: paste or write documents; they are split into passages and searched with Postgres full-text search (works on the embedded development database too). Upgrade path to embeddings is documented, not built.
- **Answers with receipts**: the model gets the best passages as numbered sources and must cite them; the interface shows citations inline and a Sources panel with the exact passage. If nothing in the library matches, the answer says so instead of guessing.
- **Usage and plans**: messages per month and library size by plan, enforced on the server, shown on the dashboard.
- **Providers**: Anthropic and OpenAI by environment variable, and a keyless **demo model** that answers from the retrieved passages so the product runs, and is testable, with no key. The demo model is labelled in the interface.
- **Workspace behaviour**: a house instruction and default model per workspace.
- **API**: `POST /api/v1/ask` with a workspace API key returns an answer and its sources.

## Design: why it will not look like the usual AI product

The usual look is a purple-blue gradient, glowing orbs, rounded bubbles and a sparkle icon. Quire does the opposite on purpose:

- **Paper and ink.** Warm paper background, near-black ink, one signal colour (vermilion) used only where meaning lives: citations, the streaming caret, links, focus. Dark mode is warm ink, not blue-black.
- **A transcript, not bubbles.** Messages are set like a document: a narrow gutter with the speaker, full-width text, comfortable line length. Answers are typeset in a reading serif (Newsreader); questions and interface text are Geist; headlines use Instrument Serif; numbers and metadata use Geist Mono. Three families, each with a job.
- **Citations are the hero element.** Numbered marks in the text open the exact passage; a Sources column sits beside the answer on wide screens and becomes a sheet on phones.
- **Calm motion.** A soft block caret while streaming, one gentle fade per message, no bouncing dots. Everything stills under reduced motion.
- **Empty state is a page, not a box**: a serif greeting and four prompt "recipes" written for the sample library.

Accessibility: the transcript is a labelled log region that announces finished answers (not every token); citations are real buttons with names; the composer works from the keyboard (Enter to send, Shift+Enter for a new line, Escape to stop); contrast is checked by the same axe suite as Beacon, in light and dark.

## Deliberately not built

Image generation, voice, file upload parsing (PDF and Office), web search and multi-model comparison. Each is a product decision for the buyer; the structure leaves room for them and the README says where.
