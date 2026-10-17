# Changelog

New components, blocks and changes, newest first. The same list is at https://ui.ballmac.com/changelog. This file is generated: edit `apps/www/lib/changelog.ts` and run `pnpm changelog`.

## 2026-10-18: Search results, a notifications inbox, an upload manager, a knowledge manager and a developers page

- Search 1, search results page: a large search box (press / to reach it), the type of result as a filter with live counts, a date filter and a sort, results with a trail and highlighted words, Show more, and a no-results page that suggests a spelling and lists what to try. A new Search results section on /blocks
- Inbox 1, notifications page: grouped by day with unread marked by an accent and a dot, mentions and comments with excerpts, requests answered right in the list (Approve, Deny, Accept, Decline), keyboard triage (J and K to move, E to archive, U for read or unread) and an Undo bar after archiving. A new Notifications section
- Upload 1, upload manager: a drop area that reacts to dragging, validation that says why each file was refused, and a list where every file has its own state (waiting, uploading with progress, finishing, done, or failed with the reason and Retry), real previews of images, cancel through an abort signal, and a summary with Clear completed. A new File upload section
- Agent 8, knowledge manager: a health bar across an agent's sources, each source with sync progress or its failure and a retry, a switch for whether the agent may use it, and a panel that shows which passages come back for a question, with the matching words marked. It shows retrieval rather than a generated answer, so you can see exactly what the agent would find
- Dev 1, developers page: a 14-day request chart with errors stacked and the numbers in a table for screen readers, success rate and median time, API keys shown in full exactly once and revoked behind a confirmation, test and live modes with a warning, and a request log with a filter, expandable responses and copy as curl. A new Developer section
- New match-highlight: the words of a search marked in text, with real mark elements in a theme tint, and helpers to split a query, test a match and count matches. It works on the server and on Arabic and Hebrew text. Help 1 now uses it instead of its own copy (no change in behaviour)
- All pass every scorecard check, including 360 px (checked down to 320 px), reduced motion and right to left, and ship their tests. match-highlight's mirror check is marked not applicable, with the reason shown, because words inside a line of text keep the order of their language. The MCP server finds them for results, notifications, alerts, files, developer, logs, knowledge and rag

## 2026-10-17: A public profile, a help center, assistant memory and an agent builder

- Profile 1, public profile: a cover and avatar with art drawn from the handle when there are no pictures, a verified badge, Follow that updates the follower count straight away and undoes itself if it fails, stats that count up, an About card, project cards that light up under the pointer, and an Activity tab with a contribution graph. A new Profile section on /blocks
- Help 1, help center home: a hero search that suggests articles as you type with the matches highlighted (arrow keys, Enter, Escape, and / to jump to it from anywhere), topic cards, popular articles, and a contact strip with who is online. The contact strip stays even when the guides fail to load. A new Help center section on /blocks
- Agent 6, assistant memory: a three-ring chart splitting what an AI assistant remembers, a switch to pause memory, each memory with where it was learned and how often it was used, edited in place, pinned, or forgotten with seven seconds to undo, and Forget everything behind a confirmation
- Agent 7, agent builder: instructions and a model, each tool set to off, ask first or allowed (tools that change data are flagged and start at ask first), the knowledge the agent may read, guardrails, and a live preview that follows every setting, including the approval step for a tool set to ask first. Publishing shows submitting, success and error
- New cover-art: cover pictures drawn from a seed in your theme's chart colors (color fields, rings, bars, dots and waves). The same seed always draws the same picture, using plain arithmetic so the server and every browser agree. Profile 1, Help 1 and Agent 7 use it as the fallback for images you have not set
- All pass every scorecard check, including a 360 px check, the right-to-left mirror and reduced motion, and ship their tests. The MCP server finds them for profile, help, support, memory, builder and cover

## 2026-10-17: Team chat, eval results, a welcome window and a shortcuts editor

- Chat 1, team chat: channels and direct messages with unread counts and presence, messages grouped by person and day with a New divider, reactions, threads in a side panel, @mentions that suggest people as you type, and messages that show while sending and offer Retry when they fail. A new Team chat section on /blocks
- Agent 5, eval results: a verdict that calls out cases that passed before and fail now, each metric against the baseline with Better or Worse in words (lower is better for time and cost), cases filtered to regressions or improvements, and both answers side by side or as a diff
- Desktop 7, welcome window: the app's name and version, ways to start (new, open, clone) with shortcuts in the platform's notation, and recent projects to search, open with Enter and remove from the list
- Desktop 8, keyboard shortcuts editor: commands grouped and searchable by name or by pressing the keys, a recorder on each row, a warning with Replace when a combination is taken, reset per command and Restore defaults. It saves only what differs from the defaults
- New shortcut lib: formatShortcut, shortcutFromEvent and normalizeShortcut, shared by Desktop 1, 7 and 8. Option+letter on a Mac records the letter rather than its symbol. Desktop 1 is 1.0.1 and installs it; its behaviour is unchanged
- All pass every scorecard check and ship their tests. The MCP server finds them for slack, channels, messaging, evals, welcome, hotkeys and keybindings

## 2026-10-17: AI agent blocks, an integrations directory and an audit log

- A new AI agents section with four free blocks for products where agents do the work and people stay in charge. Until now the catalog had chat blocks only
- Agent 1, live agent run: the task and its status ("Waiting for you" is announced), the plan beside it, every note, tool call and approval request in order, approvals that pause the run, the result with copy, Stop, Run again and a follow-up box
- Agent 2, approvals inbox: every action agents are waiting on, newest first with its risk, the full request beside the list, A and D to approve or deny, J and K to move, and one button that approves every low-risk request. After a decision the next request is selected, so a queue clears from the keyboard
- Agent 3, runs and traces: runs with status, time, tokens and cost, and a waterfall of model calls, tool calls and retrieval for the selected run. A failed span opens first, and each span tells screen readers its kind, start and duration. Agent 4, prompt playground: one prompt on two models side by side, {{variables}} that become fields, ⌘Enter to run, time, tokens and cost for each answer, ratings and Pick this one
- Settings 4, integrations directory: search, categories, connected ones first, Connect with progress and the reason when it fails, Disconnect after a confirmation, coming-soon entries and a request link
- Settings 5, audit log: who changed what, by people, agents, API keys and the system, grouped by day, filtered by who, area and time, each event opening to its IP address, a before-and-after diff and raw details, and a CSV export
- All six have loading, empty and error states (the playground has running and error), pass every scorecard check and ship their tests. The MCP server finds them for agent, approval, trace, observability, playground, audit and integrations

## 2026-10-17: Desktop app blocks: the screens every Tauri and Electron app needs

- A new Desktop apps group with six free blocks for the windows people expect in a desktop app. Each draws real window chrome through app-window and handles like macOS or Windows from the page's feel, or from a feel prop
- Desktop 1, preferences: toolbar tabs and a window named after the pane on macOS, a side nav and setting cards on Windows. Launch at login, menu bar, appearance, update channel, and a shortcut recorder that writes ⇧⌘Space on a Mac and Ctrl+Shift+Space on Windows. Settings apply as they change, with no Save button
- Desktop 2, menu bar and tray panel: a clipboard history with search, pins and a pause switch, keyboard selection (Up, Down, Enter, ⌘P), and Preferences and Quit. Drawn opening from a menu bar slice or above a taskbar, or on its own for the real tray window
- Desktop 3, software update: the whole cycle as states (checking, available with release notes, downloading with progress, ready to relaunch, up to date, failed). Leave state out and it runs itself; the AI notes show how to wire tauri-plugin-updater and electron-updater
- Desktop 4, licence activation: a trial meter, a key field that cleans up pasted keys, the reason when a key is refused, the licensed view with deactivate, and a trial-ended mode. Desktop 5, permissions setup: why each permission is needed, the exact System Settings path for one that was turned off, and a re-check when the window gets focus back. Desktop 6, About: version and build with a copy button, links, acknowledgements and Check for updates
- Wording and button order follow the platform: Title Case and the default button last on macOS, sentence case and the default button first on Windows, "this Mac" or "this PC". frame={false} drops the chrome inside a real native window
- All six pass every scorecard check (axe in light and dark, 360 px, reduced motion, right to left, console, keyboard) and ship their tests with `ballmac add --with-tests`. The MCP server finds them for desktop, Tauri, Electron, preferences, tray and licence

## 2026-10-12: Quality, measured: scorecards on every item, and ballmac check for your own app

- Every item page now has a quality scorecard, measured in a real browser: an axe-core accessibility scan in light and dark, no sideways scrolling at 360, 390 and 1280 px, reduced motion, a right-to-left mirror, a clean console, a keyboard pass, states, tests and size. 477 items and 1,032 examples were loaded; the results are public at /quality
- The first full run found 55 failing checks. They were real: a table that stretched the page sideways on phones in five Pro blocks, skeletons wider than a 360 px screen, compact amounts written differently on the server and in the browser (a React hydration error in three dashboards), a map route that kept animating for visitors who asked for less motion, and a notification table that keyboard users could not scroll while a save was running. All are fixed, and the affected items have new versions that `ballmac update` merges into your copy
- `npx @ballmac/cli check` holds your own app to the same bar. It reads your source (read-only, offline) and reports missing loading and error states, images and buttons without names, positive tabindex, hand-rolled dialogs, hard-coded colors, endless decorative motion and layouts that break on a phone, each with the fix. `--url` also loads your running app with your own Playwright and axe. Settings, suppression comments and a GitHub annotations format are in /docs/check
- The Ballmac MCP server (1.4.0) has two new tools: `get_quality_rules` so an agent reads the rules before it writes a component, and `audit_project` so it can check its work before it says it is done
- The measurement is honest about its limits: automated tools find only a part of accessibility problems, a loading spinner is kept turning on purpose, WCAG 2.2's 24 px target size is reported as a note rather than a failure, and some items are not mirrored by design (code, charts, keyboard shortcuts), each with its reason shown

## 2026-10-12: Cove: a Tauri desktop starter that looks native on macOS and Windows

- Cove is a third Pro starter and the first for the desktop: a Tauri 2 notes app with folders, pinning, search that needs every word, trash with undo, Markdown with a preview, and a command palette. It is a real app you can ship, and the quickest way to see the platform feels in a working window
- On a Mac it has traffic lights in the sidebar column that dim when the window is in the background, the system blur behind the sidebar (a real NSVisualEffectView), the native menu bar with the system's own undo and paste, and rounded corners. On Windows it has 46 px caption buttons, a title bar with the app icon and a menu bar, a 3 px accent bar on the current item and square corners the system rounds
- Every command is defined once and runs from the palette, the keyboard and both menus, with shortcuts written the way each platform writes them (⇧⌘N, Ctrl+Shift+N). Settings switch the look between macOS, Windows, iOS and the web, the theme, and the motion
- The interface also runs in a browser with no Rust installed. It is tested in WebKit and Chromium with each platform's user agent: both looks, light and dark, keyboard use, axe, High Contrast, reduced motion and the smallest window. Notes are one JSON file; replace the four-method storage to add sync
- The README, a customisation guide and a release guide cover signing and notarizing on macOS, signing on Windows, and updates

## 2026-10-12: States: loading, empty and error built into the blocks

- Every data block takes one prop, state: "loading", "ready", "empty" or "error", with onRetry, emptyState and errorState. Loading is a skeleton with the same shape as the block, empty is a clear message, error has a retry. 11 blocks: Mail 1, Dashboard 1 and 2, Kanban 1, Calendar 1, Blog 1, Changelog 1, Billing 1 and 2, Settings 3 and the two AI chats
- Every form block (Login 1 and 2, Sign up, Forgot password, Verify, Contact, Newsletter, Invite, Onboarding, Settings 1 and 2) can show submitting, success and error from the same prop, so you can drive it from your own async code. Fields lock while a request is in flight, so nothing is sent twice. Several also take defaultValues or defaultEmail to prefill
- New state-view for your own views, and use-resource: a fetch state machine that aborts replaced requests, never lets a slow old answer win, and retries. stateOf() maps TanStack Query and SWR results onto the same states
- Block pages have a State switch above the preview, with the prop to copy and what each state does, and a States table. A link such as /blocks/mail-1?state=loading opens a state. New /docs/states
- Each item can list its states in its metadata, and a block with nothing to load says why. The registry JSON and the API carry them, and a build check fails when a free block does neither or a state example would break a production build
- Skeletons are a little stronger on light pages and their pulse follows the theme's decorative-loops switch. Announced as loading, busy while loading, errors announced as alerts, and focus is never moved for you

## 2026-10-12: Platform feels: every component can handle like macOS, iOS or Windows

- A feel is everything about a product except its colours: control and menu sizes, corners, text scale, focus ring, shadows, sidebar style, frosted surfaces, press feedback, scrollbars, window controls and motion. Four feels: Web (today's look, the default), macOS, iOS and Windows. They work on top of any colour theme
- Install one with `@ballmac/feel-macos`, `-ios`, `-windows` or `-web`, or `@ballmac/feel-auto`, which includes all four and sets the right one from the device before the first paint (no flash). `useFeel()` and `setFeel()` let people override it
- Tailwind's shadow and text scales follow the feel, and one rule restyles the focus ring on every component that uses shadcn's standard focus classes (250 Ballmac items, and shadcn's own). Button, Input, Select, Tabs, Sidebar, menus, popovers and hover cards read feel tokens for sizes, corners, frosting and press dimming; nothing changes without a feel
- New `app-window`: the window chrome of a real Tauri or Electron app. A title bar that drags the window and maximizes on double-click, with traffic lights on the left for macOS, caption buttons on the right for Windows, none for iOS and web. No Tauri or Electron dependency: you pass the actions. Based on tauri-controls (MIT)
- The theme builder has a Platform feel picker, a window in the preview, and a Compare view that shows your colours in all four feels side by side. A link such as /themes?fe=windows opens one. New /docs/feels covers Tauri v2 and Electron setup
- The 12 colour themes and the base theme now carry the web-feel tokens. New checks fail the build when an endless loop ignores the theme or a component draws its own focus ring without being listed
- These are web components that feel like each platform, not native controls, and Ballmac UI is not affiliated with Apple or Microsoft
- The Ballmac MCP server (from 1.2.0) knows about feels: compose_page takes a `feel`, or reads macOS, Windows, iOS, Tauri or Electron from the request, and returns the feel to install plus how to wire it

## 2026-10-11: Motion is part of the theme

- Six settings describe how a product moves: speed, bounce, travel, hover, stagger and decorative loops. Durations, easings, hover lift, button press and the CSS spring curve are all derived from them, and the defaults reproduce the current look exactly
- Tailwind's own scales follow: duration-75 to duration-1000, delay-* and ease-out, ease-in and ease-in-out read the theme, and a new ease-spring class is a real spring written as a CSS linear() easing. Dialogs, popovers, menus and accordions follow too, through tw-animate-css's enter and exit animations. Existing components pick this up with no edits
- Five ready-made feels, each its own registry theme: @ballmac/motion-native, -calm, -snappy, -playful and -still. The twelve colour themes each carry a feel that suits them, so installing Violet brings its motion too
- The theme builder has a Motion group (a personality picker and a slider for each setting) and a motion lab that shows easing curves drawn from the real spring, hover and press, stagger, durations, JavaScript springs and loops, with a Preview reduced motion switch. A link such as /themes?mo=playful opens a feel
- Reduced motion is part of the theme: a prefers-reduced-motion rule removes travel, lift, bounce and loops and keeps fades. Still ships those values to every visitor
- Motion presets 1.1.0: spring, duration, variants and stagger read the theme's variables, and new useMotion, useLoopsPaused and MotionProvider hooks give the same numbers in JavaScript. Decorative loops (13 components) hold still when loops are turned off; spinners and thinking indicators keep running
- Hover lift and button press follow the theme in Card, Button, Suggestion Chips, Workspace Card, three blocks and seven templates. A new `pnpm bump` command writes the version bump and changelog entry the version check asks for
- The Figma tokens export now includes the motion settings as W3C duration and number tokens

## 2026-10-11: Fixes: server-component crashes, and support for Next.js 16.4 Cache Components

- Bento Grid, Team Switcher, Lock Screen and Control Center failed with "Attempted to call isMediaImage() from the server" when a server component rendered them. The helper now lives in its own small item, media-image, and the components import it from there (Media still exports it for code that used it). Each is now 1.0.1, so `ballmac update` merges the fix into your copy
- The pages that read params in the Atlas, Goods, Podcast and Publication templates now do so inside Suspense, which Cache Components (the default in new Next.js 16.4 apps) requires: 1.0.1 each
- A new build check fails when a file that runs on the server imports a function from a file marked "use client", so this kind of crash is caught before it ships
- Next.js 16.4 turns on Cache Components in new projects, which does not allow reading the current time while a page is prerendered. Calendar, Date Picker and the Calendar 1 block did (react-day-picker reads today), so any page using them failed to build. Calendar now reads it inside Suspense with a same-size placeholder (pass `today` to skip that), Date Picker works out its year dropdown only when it opens, and Calendar 1 uses its own today: 1.0.1 each. Every free component, block and template, and every Pro block, now builds in a fresh Next.js 16.4 app with Cache Components on

## 2026-10-11: Update components without losing your edits, and install their tests

- New command line tool, `npx @ballmac/cli`: it runs the shadcn CLI for you and remembers what it installed (ballmac.lock.json), so `ballmac update` can merge a new version into your edited copy instead of overwriting it. Files you never touched are replaced, edits in other places are merged, and overlapping edits become conflict markers
- `ballmac outdated` lists what is behind with a note on what changed, `ballmac diff` shows your own changes, and `ballmac track` adopts items you installed with plain shadcn. Originals are backed up before anything is written, and `--dry-run` previews everything
- Every item now has a version and a changelog written for people who customised the file; component pages show them under What changed
- 200 free items ship with the test we run on them. `ballmac add dialog --with-tests` installs it next to the component, with the packages it needs and a vitest config if you have none
- The Ballmac MCP server gets two tools: `get_changes` (what changed since a version, breaking changes flagged) and `get_tests`
- A build check now fails when an item's files change without a version bump and a changelog entry

## 2026-10-07: Founding offer: $49 until 21 October, then $99

- Pricing page rebuilt around the founding offer: a live countdown to 21 Oct 2026, 11:59 pm IST, the $99 list price struck through
- See what is inside before you buy: the 40 second film with captions and six Pro block previews
- A free sampler of three Pro blocks for your email, and a reminder email 72 hours and 24 hours before the founding price ends
- Pro block pages and the locked copy-code prompt say when the founding price ends
- A Founders page and a desk in the Pro library: opt in to be listed by name and vote on the next blocks
- After 21 October, or when the 25 founding licences are gone, the site switches to $99 by itself

## 2026-10-07: Install with no setup, and cleaner theme links

- Ballmac UI is now in the official shadcn registry directory, so `npx shadcn@latest add @ballmac/button` works with nothing to configure. The registry entry is kept as a fallback for older CLIs and for the shadcn MCP server, which only reads components.json
- Theme builder: every preset has its own clean link (for example /themes/rose), a customised design is /themes?h=…, a note beside Copy link explains that your design lives in the link and is never stored, and copying is announced to screen readers
- Clearer page titles and descriptions for the components, blocks, templates and themes pages, structured data for the organisation and the website, and an llms.txt that now lists blocks, templates and Pro
- The analytics scripts load only on Vercel, so running the site locally or on your own host no longer logs console errors

## 2026-10-05: Log in to Pro with your licence key

- A Pro log in page at /pro: paste your licence key once, with no password and no account. The key stays in an encrypted cookie in your browser and is checked again on every request, so a revoked key stops working within minutes
- Your Pro library: install commands with your key already filled in (hidden on screen, real on the clipboard) for the shadcn CLI, AI agents through MCP and the starter apps, plus browser downloads of Beacon SaaS, Quire and the Figma tokens
- Pro block pages show the real source with copy buttons once you are logged in, while the pages stay public and static for everyone else
- A Log in and Get Pro button in the header, which becomes a Pro library link after you log in
- Buyers are logged in automatically when they return from checkout, with no key to paste
- A support page for bugs, questions, licence and billing help, and suggestions; messages go to a private inbox and you get a confirmation by email
- Pricing copy corrected: Pro adds 150 blocks and two starter apps (it has no templates)

## 2026-10-04: Quire, a second Pro starter, and a new look for Beacon

- Quire: an AI starter that answers from your own documents and shows its sources. Streaming chat with numbered citations that highlight the exact sentence, a document library with full-text search, usage limits per plan, Stripe billing, teams and a public API. It runs without an AI key on a built-in demo model
- Beacon SaaS was redesigned: a new landing page, sign-in and onboarding, and app shell

## 2026-10-03: Ballmac UI Pro and the first public release

- Ballmac UI Pro: 150 premium blocks (heroes, features, pricing, dashboards, app screens, ecommerce, content, sign-in and onboarding, marketing extras), all with light, dark and right-to-left support
- A private registry for Pro items, installed with the shadcn CLI and the MCP server using a licence key
- Beacon SaaS, the first Pro starter app: sign-in, workspaces with teams and invitations, Stripe billing, a dashboard and API keys
- Figma design tokens (W3C format) for all 13 themes, plus capture tooling for building a Figma library
- @ballmac/mcp 1.0 on npm: search the catalog, read when to use each item and get the install command from your agent
- A designed 404 and error page, tidier page titles and descriptions across the site, and stricter security headers

## 2026-10-02: Themes, right-to-left, translations and image slots

- Twelve free themes and a live builder: change hue, radius, density and font, check contrast in light and dark, then install
- Right-to-left support across components, blocks and templates, with an RTL toggle on every preview
- Built-in text moved behind one translation provider, with the full key list available as JSON
- Heroes, features, cards, galleries and templates take an image or media prop with required alt text and dark-mode variants

## 2026-10-01: Templates, blocks and a full audit

- Seventeen templates with their own look, from product sites to admin apps, docs, stores and a podcast
- Sixty-three free blocks grouped by purpose, from marketing sections to application screens
- Desktop and device components: windows, docks, menu bars, Finder-style browsing, Launchpad, lock screen and device frames
- Audit fixes: page weight cut from 7.5 to 11.8 MB of JavaScript down to 1.3 to 2.0 MB, hydration fixes for visitors who prefer reduced motion, focus rings and pinned dependency versions

## 2026-09-30: Forms, data, SaaS patterns and AI interfaces

- Forms: date and range pickers, currency, phone, tags, multi-select, stepper and signature pad
- Data display: calendar, data table, charts, carousel, drawer and resizable panels
- SaaS patterns: onboarding checklist, settings panel, usage meter, billing card, plan selector and notification center
- AI interfaces: chat messages, reasoning, tool calls, citations, a prompt box, agent plans and approval cards

## 2026-09-28: Ballmac UI preview

- Registry at ui.ballmac.com/r with the Ballmac theme and motion presets
- Primitives, motion, AI interface and developer components
- Blocks and a launch-page template
- Docs for installation, the CLI and registry, and MCP
