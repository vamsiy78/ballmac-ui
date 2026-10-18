import { EmailForm } from "@/components/site/email-form"

/** Release notes by email. Shown only once the audience exists (NEXT_PUBLIC_CHANGELOG_EMAIL=on at build); until then the feeds are the way to subscribe. */
export function ChangelogEmailSignup({ className }: { className?: string }) {
  if (process.env.NEXT_PUBLIC_CHANGELOG_EMAIL !== "on") return null
  return (
    <div className={className}>
      <h2 className="mb-2 text-sm font-semibold">Get it by email</h2>
      <EmailForm
        endpoint="/api/changelog-subscribe"
        label="Email address for release notes"
        button="Subscribe"
        consent={<>We email when something ships, about once or twice a month. Unsubscribe from any email.</>}
        doneMessage="Subscribed. Check your inbox for a confirmation."
      />
    </div>
  )
}
