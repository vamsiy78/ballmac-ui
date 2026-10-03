# Pro batch 9: marketing extras (10)

Looked at (not copied): shadcn marketing blocks (MIT), Radix navigation menu and Headless UI disclosure patterns for keyboard behaviour (docs only), Cal.com and Calendly booking flows for pacing, Linear and Vercel footers and error pages for structure, plus paid kits for layout ideas only. No code was taken from paid or unlicensed kits. Names, products and people are invented.

| Block | Question it answers |
|---|---|
| header-pro-1 | Where do I go? Mega menu with grouped links and a feature card |
| header-pro-2 | What is new? Floating pill that shrinks, with a dismissible announcement |
| footer-pro-1 | Is this company real and up? Link columns, signup, status pill, language |
| team-pro-1 | Who are you? Team grid with filters and expandable bios |
| comparison-pro-1 | How do you compare? Table with differences-only and computed counts |
| contact-pro-1 | How do I reach you? Form with topics, details and offices |
| contact-pro-2 | Can I book a time? Calendar grid, slots and a short form |
| newsletter-pro-1 | What will I get? Topics and frequency, with a sample issue |
| download-pro-1 | Which file do I need? Platform tabs, builds, checksums, older versions |
| error-pro-1 | Where did it go? 404, 500, 403 and offline in one block |

**Decisions**
- The mega menu is a set of disclosure panels, not an ARIA `menu`: buttons with `aria-expanded`, Escape closes and returns focus, left and right arrows move along the bar, down enters the panel. Hover opens it as a convenience, never as the only way.
- The calendar is a real grid of buttons with roving focus and arrow, Page Up and Page Down keys. "Today", slots, bookable weekdays and full days are props; the week starts where you say so, so the server and browser never disagree.
- Anything that depends on the device (platform detection for downloads) runs after mount, so server and browser markup match.
- The comparison always prints a note about where facts came from. Demo products are invented, and the block says so.
- Forms (footer, contact, booking, newsletter) validate on submit, mark fields `aria-invalid`, move focus to the first problem and to the new heading afterwards. Nothing is stored or sent without your handler.
- The error block chooses the right actions for each case: search for 404, a copyable reference and Try again for 500, a plain explanation and the way to ask for access for 403, and Try again for offline.

**Lessons**
- A locale's first day of the week is not available in every browser; make it a prop.
- Sticky headers and focus moves after a state change need a frame: tests wait for focus instead of asserting at once.
