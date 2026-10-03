import type { Metadata } from "next"
import Link from "next/link"

import { CodePanel } from "@/components/site/code-panel"
import { DocsPage } from "@/components/site/docs-page"
import { MessageTable } from "@/components/site/message-table"
import messages from "@/lib/generated/messages.json"

export const metadata: Metadata = {
  title: "Translating Ballmac UI (i18n)",
  description: "Translate every built-in string, set the locale for dates and numbers, and ship any language with one provider. The full key list is free to download.",
  alternates: { canonical: "/docs/i18n" },
}

export default function I18nPage() {
  const count = Object.keys(messages).length
  return (
    <DocsPage
      title="Translating Ballmac UI (i18n)"
      lead={`Every built-in label, placeholder and screen reader text is a message with an English default. One provider translates all ${count} of them and sets the locale for dates and numbers.`}
    >
      <h2>Quick start</h2>
      <CodePanel lang="bash" code={`npx shadcn@latest add @ballmac/i18n`} />
      <CodePanel
        title="app/layout.tsx"
        code={`import { I18nProvider } from "@/lib/ballmac/i18n"
import ar from "@/messages/ar.json"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <I18nProvider locale="ar" messages={ar}>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}`}
      />
      <p>
        <code>messages</code> is a flat object from key to text. Anything you leave out stays in English, so you can translate in stages. Download the
        complete list of keys with their English text from <a href="/i18n/en.json">/i18n/en.json</a>, copy it to <code>ar.json</code>, and translate
        the values.
      </p>

      <h2>Placeholders and plurals</h2>
      <CodePanel
        lang="json"
        title="messages/ar.json"
        code={`{
  "pagination.nextPage": "الصفحة التالية",
  "data-table.pageOf": "الصفحة {page} من {total}",
  "workspace-card.members_one": "عضو واحد",
  "workspace-card.members_two": "عضوان",
  "workspace-card.members_few": "{count} أعضاء",
  "workspace-card.members_many": "{count} عضوًا",
  "workspace-card.members_other": "{count} عضو"
}`}
      />
      <p>
        <code>{"{name}"}</code> is replaced with a value. Where a message depends on a number, add one key per plural category your language has (
        <code>_zero</code>, <code>_one</code>, <code>_two</code>, <code>_few</code>, <code>_many</code>, <code>_other</code>, chosen with{" "}
        <code>Intl.PluralRules</code>); English needs only <code>_one</code> and <code>_other</code>, which are built in.
      </p>

      <h2>Locale: dates, numbers and money</h2>
      <p>
        The provider&apos;s <code>locale</code> is used by every component that formats a number, a date, a currency or a duration. Without a provider,
        <code> &lt;html lang&gt;</code> is used, then <code>en-US</code>. A <code>locale</code> prop on a single component always wins. To get Western digits in
        an Arabic UI, use <code>ar-u-nu-latn</code>.
      </p>

      <h2>Your own components</h2>
      <CodePanel
        code={`"use client"
import { useLocale, useMessages } from "@/lib/ballmac/i18n"

export function Greeting({ name }: { name: string }) {
  const msg = useMessages()
  return <p>{msg("app.greeting", "Welcome back, {name}", { name })}</p>
}`}
      />
      <p>
        <code>msg.rich</code> fills placeholders with React nodes (for example a <code>&lt;kbd&gt;</code>). If you already use next-intl, i18next or Lingui,
        keep them for your app and pass their output to <code>I18nProvider</code> as <code>messages</code>.
      </p>

      <h2>What is translated, and what is not</h2>
      <ul>
        <li>All components: accessible names, placeholders, hidden text, default button and empty-state text, status words and templated sentences.</li>
        <li>Props still win. <code>closeLabel</code>, <code>emptyMessage</code>, <code>label</code> and similar props override the dictionary.</li>
        <li>
          Blocks and templates are copy-in starting points. Their headlines and sample copy are props or live in the file, so you edit them as content.
          The right-to-left layout is covered in <Link href="/docs/rtl">RTL</Link>.
        </li>
        <li>Sample values (such as the <code>.env</code> placeholder) and brand names are not messages.</li>
      </ul>

      <h2>All {count} messages</h2>
      <MessageTable messages={messages as Record<string, string>} />
    </DocsPage>
  )
}
