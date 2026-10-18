import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "trust-1",
  type: "registry:block",
  title: "Trust 1: security and trust center",
  description:
    "A trust center: certification cards with dates, the security controls behind them, documents where audit reports ask for a request under a confidentiality agreement, a subprocessor table with change alerts, and a disclosure contact.",
  category: "blocks",
  blockCategory: "trust",
  tags: ["trust", "security", "compliance", "soc 2", "iso 27001", "gdpr", "hipaa", "subprocessors", "privacy", "enterprise", "audit"],
  files: [{ path: "components/blocks/trust-1/trust-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "blur-fade", "button", "checkbox", "cover-art", "dialog", "input", "skeleton", "spotlight-card", "state-view", "return-focus"],
  examples: [
    { name: "trust-1-demo", title: "Default", file: "trust-1-demo.tsx" },
    { name: "trust-1-request", title: "Requesting a report", file: "trust-1-request.tsx" },
    { name: "trust-1-loading", title: "Loading", file: "trust-1-loading.tsx" },
    { name: "trust-1-error", title: "Could not load", file: "trust-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "trust-1-loading", trigger: "state=\"loading\"", note: "Skeleton certificate and control cards under the real header, announced as loading." },
    { id: "error", title: "Could not load", example: "trust-1-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry). The header stays so the page never looks broken." },
  ],
  ai: {
    summary:
      "A security and compliance page. <Trust1 status={{ label, ok, updated }} certifications={[{ id, name, status: 'certified' | 'aligned' | 'in-progress', detail, valid }]} groups={[{ id, title, icon, controls: [{ text, status: 'done' | 'progress' }] }]} documents={[{ id, name, description, access: 'public' | 'gated', format, updated, href }]} subprocessors={[{ name, purpose, location, data }]} securityEmail companyName onDownload onRequestAccess={async (doc, { email, company }) => …} onSubscribe={async (email) => …} />. Gated documents open a request dialog with validation and submitting, success and error states.",
    whenToUse: ["The trust, security or compliance page a B2B buyer's security team reads", "Sharing SOC 2 and penetration test reports behind a request"],
    whenNotToUse: ["A privacy policy or terms (plain text pages)", "A system status page (use the relay template's status page or stats-pro-2)", "A cookie banner (use cookie-consent)"],
    composesWith: ["header-2", "footer-2", "about-1", "faq-1", "contact-1"],
    a11y: [
      { keys: "Request access", action: "Opens a dialog whose fields have labels; errors are announced and linked to their fields; focus returns to the button afterwards" },
      { keys: "Status", action: "Certified, Compliant and In progress are words with an icon, never color alone; controls in progress say so in the text" },
      { keys: "Subprocessors table", action: "A labelled, focusable scroll region on narrow screens, with row headers" },
    ],
    customization: ["companyName for the confidentiality line", "defaultRequestId opens a request at first", "onRequestAccess should create the request in your CRM or send a secure link; never expose the file URL to the browser until it is approved"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
