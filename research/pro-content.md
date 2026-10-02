# Pro batch 7: content, blog, changelog, FAQ and careers (15)

Looked at (not copied): shadcn blocks and the shadcn blog example (MIT), Astro and Docusaurus blog themes (MIT), Linear, Vercel and Raycast changelogs for structure only, Canny and Productboard public roadmaps for interaction ideas only, plus paid kits for layout ideas only. No code was taken from paid or unlicensed kits. People, companies and posts in the demos are invented.

| Block | Question it answers |
|---|---|
| blog-pro-1 | What have you written? Featured post, category chips, search, Load more |
| blog-pro-2 | Can I read this comfortably? Progress bar, following contents list, share, author box |
| blog-pro-3 | What matters today? Magazine front page |
| blog-pro-4 | What did I miss? Archive by year with pagination |
| blog-pro-5 | Who wrote this? Author profile with Latest and Popular |
| blog-pro-6 | What do you write about? Topic cards and tag cloud |
| blog-pro-7 | Can I copy this? Install tabs, code with line numbers, callouts, footnotes |
| blog-pro-8 | Can I join in? Comments with validation, replies, likes and sorting |
| blog-pro-9 | Where am I in the series? Progress, parts, mark as read, previous and next |
| changelog-pro-1 | What changed? Timeline with kind filters and shareable links |
| changelog-pro-2 | What is coming? Roadmap with votes |
| changelog-pro-3 | What is new in this version? Highlight cards by version |
| faq-pro-1 | Where is the answer? Search with highlights, topics, accordion |
| faq-pro-2 | Did that help? Per-answer rating beside a support card |
| careers-pro-1 | Is there a job for me? Team and remote filters, expandable roles |

**Decisions**
- Dates are ISO strings formatted in UTC with `Intl`, and relative times (comments) come from a `now` prop, so the server and browser always agree.
- Counts in headings and filter chips are computed from the data. Filter results are announced in a polite status line.
- Contents lists use real links and `aria-current="location"`; the reading progress is a `progressbar`, not decoration.
- Code is always `dir="ltr"` and focusable so it can be scrolled with the keyboard; callouts are labelled `aside` elements with a word as well as an icon.
- Nothing here collects or stores anything: comments, votes, ratings and read marks call your handlers and only live in the page.
- Roadmap items, policies (refunds, data retention), job requirements and support hours are sample text to replace.

**Lessons**
- Defining a component inside a component remounts it on every render, which drops keyboard focus from buttons pressed inside it. Use a plain function that returns JSX.
- A long list of near-identical buttons needs exact-name queries in tests (a role called "Product designer" also matches a team called "Design").
