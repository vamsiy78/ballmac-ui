# Pro batch 8: auth and onboarding (10)

Looked at (not copied): shadcn login and signup blocks (MIT), Better Auth and Clerk component patterns for flow and states (docs only), Linear, Notion and Vercel onboarding for pacing, plus paid kits for layout ideas only. No code was taken from paid or unlicensed kits. No brand logos are used; the mark is a generated initial you can replace.

| Block | Question it answers |
|---|---|
| auth-pro-1 | How do I sign in? Providers, email and password, remember me, clear errors |
| auth-pro-2 | How do I join? Sign up with a computed strength meter and a spoken checklist |
| auth-pro-3 | Is it really me? One-time code on a single real input, wrong-code state, resend countdown |
| auth-pro-4 | Can I skip the password? Magic link with a check-your-inbox step, optional passkey |
| auth-pro-5 | I forgot it. Request, check email, new password, done |
| auth-pro-6 | Does my company use single sign-on? Domain-aware split-screen sign-in |
| onboarding-pro-1 | What do you need from me? Four-step wizard that validates every step |
| onboarding-pro-2 | What are you here to do? Pick up to three goals |
| onboarding-pro-3 | Where is everything? Guided tour with a moving highlight |
| onboarding-pro-4 | Who else is coming? Email chips with paste, seats and roles |

**Decisions**
- No block stores or sends anything. Credentials, codes, emails and invitations go to your handlers; errors you throw are shown to the person in words.
- Never reveal whether an address has an account: the forgot-password step says "If there is an account…" and the handler is told not to differ.
- The demo one-time code (123456) is used only when no `onVerify` handler is passed, and is a prop, not a secret.
- Validation runs on submit, marks fields `aria-invalid`, moves focus to the first problem and names the problem next to the field. Steps and states that replace content move focus to the new heading.
- Password strength is computed from the text, shown as words and a checklist as well as colour, and the weakest allowed score is a prop.
- One-time codes use a single real input under the boxes, so paste, autofill and screen readers behave like a normal text field. Digits stay left to right in right-to-left pages.
- Choices (roles, sizes, goals, invite role) are real radio or checkbox inputs styled as cards, so keys, grouping and announcements come from the browser.
- The tour is a non-modal dialog over a made-up screen: arrow keys step, Escape leaves, focus moves to the card on each stop, and positions are percentages you set per stop.

**Lessons**
- A string like "Too short" has to be decided from the length, not from the score, or the label and the meter disagree.
- Countdowns that re-arm a timer each second need the test to advance one second at a time.
