/**
 * The Ballmac UI Pro Licence Agreement. The text lives here, as data, so the page, a plain-text copy and the tests all read the same words.
 *
 * Cross-references are written as `[[id]]` and become "section N" when rendered, so renumbering a section can never leave a wrong reference behind.
 * `**bold**` marks a defined term or an obligation worth noticing. No framework imports.
 *
 * Not legal advice: this is a licence written to favour the licensor while staying within what is commonly enforceable. Have a lawyer in India read it before
 * relying on it, and again if the business becomes a company.
 */

export const PRO_LICENCE_PATH = "/license/pro"
export const PRO_LICENCE_VERSION = "1.1"
export const PRO_LICENCE_EFFECTIVE = "24 October 2026"
export const PRO_LICENCE_EMAIL = "hello@ballmac.com"

export type Block = { p: string } | { ol: string[] } | { ul: string[] }
export type Section = { id: string; title: string; blocks: Block[] }

/** The plain-English summary shown above the terms. It is explanation only and is not part of the agreement. */
export const proLicenceSummary = {
  can: [
    "Use Ballmac UI Pro in as many projects as you like, for yourself or for clients, personal or commercial.",
    "Change the code, and ship the apps and sites you build with it.",
    "Keep using the versions you downloaded.",
  ],
  cannot: [
    "Resell, share or publish the Pro source, including in a public repository, a template, a starter, a UI kit, a Figma file or a package.",
    "Share your licence key or let more people see the source than you have seats for.",
    "Build a competing component library, template or starter from it.",
    "Use it to train, fine-tune or build a dataset for an AI model.",
  ],
  notes: [
    "One Pro licence is one person. A Team licence is for one organisation and up to 10 named people.",
    "“Lifetime updates” means for as long as we keep selling and maintaining Ballmac UI Pro. It does not mean forever.",
    "Purchases are final, with clear exceptions: if something does not work as its page says and we cannot fix it within 14 days of your request, or if we charge you in error, you are refunded. See the Refund Policy.",
    "The agreement is governed by Indian law. Disputes go to arbitration in India, and awards can be enforced in most countries.",
  ],
}

export const proLicence: Section[] = [
  {
    id: "parties",
    title: "Parties and acceptance",
    blocks: [
      {
        p: "This agreement is between **Ballmac**, a business operated from India (“**Ballmac**”, “**we**”, “**us**”), and the person or organisation that buys, or is given, a Pro licence (“**you**”).",
      },
      {
        p: "You accept this agreement when you buy a licence, activate a Licence Key, or download or use any Pro Materials, whichever happens first. If you accept on behalf of a company, you confirm that you have authority to bind it, and “you” includes that company. If you do not agree, do not buy or use the Pro Materials.",
      },
      { p: "You can reach us at hello@ballmac.com." },
    ],
  },
  {
    id: "definitions",
    title: "Definitions",
    blocks: [
      {
        ul: [
          "**Pro Materials**: everything paid in Ballmac UI and everything delivered with it: premium blocks, templates, Starter Applications, design tokens, capture files, documentation, source code, assets, updates, and access to the private registry.",
          "**Starter Applications**: the complete applications included in Pro, currently Beacon, Quire and Cove, and any that we add.",
          "**Free Materials**: Ballmac UI items released under the MIT licence at ui.ballmac.com. This agreement does not change that licence.",
          "**Authorised User**: an individual who may access the Pro Materials under your licence: one person for a Pro licence, or up to the number of seats stated at purchase for a Team licence.",
          "**Licence Key**: the credential that unlocks the private registry and the downloads.",
          "**End Product**: a website, application, product or service that you build and that includes or is derived from Pro Materials, **provided** it adds substantial functionality or content of its own and is not itself a Prohibited Product.",
          "**Prohibited Product**: any product or service whose main value is to give others the Pro Materials, or a substantially similar collection, in source or compiled form, free or paid. This includes a component library, block library, template, theme, starter kit, boilerplate, UI kit, design system, Figma or other design-tool file, no-code or page-builder component pack, code generator, AI training set or registry. A Starter Application that has only been renamed, re-themed or lightly modified and is offered as a starter, template or boilerplate is a Prohibited Product.",
          "**Client**: a person or organisation for whom you build an End Product.",
        ],
      },
    ],
  },
  {
    id: "grant",
    title: "Licence grant",
    blocks: [
      {
        p: "Subject to this agreement and to payment in full, we grant you a **non-exclusive, non-transferable, non-sublicensable, worldwide licence**, which can be ended only as stated in [[termination]], for your Authorised Users to:",
      },
      {
        ol: [
          "download, copy and modify the Pro Materials in order to build End Products;",
          "use the Pro Materials in any number of End Products, for yourself, for your employer (if the employer holds the licence) or for your Clients, whether personal or commercial;",
          "distribute and host End Products to their end users, including in compiled, bundled or deployed form; and",
          "deliver an End Product's source code to a Client **as part of that End Product only**, where the Client may use it solely to run, maintain and extend that End Product, and may not extract or reuse the Pro Materials separately or for anything else.",
        ],
      },
      { p: "Free Materials remain under the MIT licence, which you may rely on independently of this agreement." },
    ],
  },
  {
    id: "restrictions",
    title: "Restrictions",
    blocks: [
      { p: "Except as [[grant]] expressly allows, you must not, and must not allow anyone else to:" },
      {
        ol: [
          "**redistribute, resell, rent, lease, lend, sublicense, give away, publish or otherwise make available** the Pro Materials, or any substantial part of them, in source or in any standalone form;",
          "include Pro Materials in a **Prohibited Product**, or in any open-source project or **public repository, package, registry, gist, snippet, forum post, course, tutorial or screen recording** from which the Pro source can be copied. Keep every repository that contains Pro source private;",
          "**share your Licence Key**, registry credentials, downloads or account with anyone who is not an Authorised User, or put a Licence Key in client-side code, a public repository, or a build log that others can read;",
          "allow more people to access the Pro source than you have Authorised Users;",
          "**use the Pro Materials, or anything the registry or the MCP service returns, to train, fine-tune, evaluate, distil or build a dataset for any machine-learning or AI model**, or scrape, crawl, mirror or bulk-download the registry, the site or the previews to do so. You **may** use AI coding assistants and agents as ordinary tools to work on your own End Product with Pro Materials you are licensed to use, provided the assistant or service does not retain, index or republish the Pro Materials for anyone else;",
          "upload the Pro Materials to a shared or public knowledge base, index, search service or model from which others can retrieve them;",
          "circumvent, disable or interfere with licence checks, rate limits or access controls, or use automated access to the registry beyond what is reasonable for installing items into your own projects;",
          "remove or alter copyright, attribution or licence notices, including notices for third-party code;",
          "use the Pro Materials unlawfully, or in an End Product that is itself unlawful, defamatory, infringing or designed to harm others; or",
          "use our names, logos or the names of Pro items to suggest that we endorse, or are affiliated with, you or your product.",
        ],
      },
    ],
  },
  {
    id: "ownership",
    title: "Ownership and third-party material",
    blocks: [
      {
        p: "The Pro Materials are licensed, not sold. We and our licensors keep all rights, title and interest in them, including copyright, design rights and any rights in the selection and arrangement of the collection. No right is granted except as stated in this agreement.",
      },
      {
        p: "Some Pro Materials include third-party open-source components, fonts or code under their own licences, for example SIL Open Font License fonts and MIT-licensed libraries. Those licences apply to those parts and are listed in the notices shipped with the item. Names, brands, copy, figures and images in demos and Starter Applications are placeholders. You are responsible for replacing them, and for any content, images, fonts or marks you add.",
      },
    ],
  },
  {
    id: "keys",
    title: "Licence Keys and seats",
    blocks: [
      {
        ol: [
          "A Licence Key belongs to its Authorised User or, for a Team licence, to the organisation that bought it, for use by its Authorised Users only. You may use it on your own devices and in your own build and CI systems to install Pro Materials into your own projects, and nowhere else. Keep it secret.",
          "If a Licence Key is exposed, you must tell us and stop using it. We may rotate or disable any key that we reasonably believe has been shared, leaked, published or used by more than the permitted users, without notice and without refund. We may ask you to confirm that you are the rightful holder before we issue a new one.",
          "A seat may be moved to another person only if the previous person loses all access to the Pro Materials, only with our written consent, and no more than once in any 90 days.",
          "If a company buys a Pro licence, it must name the one individual who will use it. A **Team licence** is bought by one organisation for up to 10 named people (the number of seats stated at purchase). Each of them may use the shared Licence Key and the Pro Materials for that organisation's own work. A Team licence does not give the Pro source to anyone beyond those seats, to the organisation's other staff or contractors, or to Clients.",
          "We may apply reasonable rate limits and fair-use limits to the registry and the downloads.",
        ],
      },
    ],
  },
  {
    id: "updates",
    title: "Updates, support and availability",
    blocks: [
      {
        ol: [
          "**Updates.** Your licence includes the updates to the Pro Materials that we choose to release **for as long as we continue to offer and maintain Ballmac UI Pro**. “Lifetime updates” means the lifetime of the product, not of you. We may add, change, rename, split, replace or remove items, and we may release new products, editions or collections that are sold separately and are not updates.",
          "**Discontinuation.** We may stop offering or maintaining any Pro Materials at any time. If we discontinue the whole product, we will give reasonable notice where practicable. You keep the right to use the versions you have already downloaded under this agreement.",
          "**Support.** We give reasonable, best-effort help by email or through the channels we publish. We make no commitment about response times, custom work or answering every question.",
          "**Availability.** The registry, the site and the licence service are provided as available. We may suspend or limit access for maintenance, security, abuse or suspected key sharing.",
          "**Compatibility.** The Pro Materials target the framework and tooling versions stated in their documentation. We do not promise that they will work with other versions, or with future versions of third-party software.",
        ],
      },
    ],
  },
  {
    id: "payment",
    title: "Price, payment and taxes",
    blocks: [
      {
        p: "Prices are shown at checkout. Payment is handled by a payment provider that acts as merchant of record, and its terms also apply to your payment. You are responsible for any taxes, duties or charges the provider adds. Your licence takes effect only once payment is complete. If a payment is reversed, charged back or found to be fraudulent, we may suspend the Licence Key and end the licence immediately.",
      },
      {
        p: "We may change prices, and offer or withdraw introductory or founding prices, at any time for future purchases. A price change does not affect a licence you have already paid for, and an introductory price does not oblige us to offer it again.",
      },
    ],
  },
  {
    id: "refunds",
    title: "Refunds",
    blocks: [
      {
        p: "The Pro Materials are digital content that is made available as soon as you pay, so purchases are final except in the cases below. The full policy is the Refund Policy at ui.ballmac.com/refund, which forms part of this agreement. The Refund Policy on ballmac.com covers Ballmac's Mac apps and does not apply to the Pro Materials.",
      },
      {
        ol: [
          "**Something does not work.** If a Pro item does not do what its page says (it fails to install, errors in a supported setup, or behaves differently from its documentation) and you tell us at hello@ballmac.com within 30 days of purchase, we will fix it or give you a working alternative within 14 days of your request. If we cannot, we will refund the full price you paid.",
          "**A mistake on our side.** If you are charged twice, charged the wrong amount or hit a technical error at checkout, we will refund the wrong payment in full.",
          "**After a refund** the licence for that purchase ends, the Licence Key stops working, and you must stop using the Pro Materials and delete the copies you hold, except in End Products that you have already delivered to end users.",
        ],
      },
      {
        p: "By buying, you ask us to start providing the Pro Materials immediately and, to the extent the law allows, you accept that you lose any right to withdraw from or cancel the purchase once access begins. Nothing in this agreement limits rights that you have as a consumer and that cannot lawfully be waived, including your rights if digital content does not conform to the contract.",
      },
    ],
  },
  {
    id: "warranty",
    title: "Warranty disclaimer",
    blocks: [
      {
        p: "To the fullest extent the law permits, the Pro Materials, the registry and all support are provided **“as is” and “as available”, without warranties of any kind**, whether express, implied or statutory. This includes any warranty of merchantability, fitness for a particular purpose, title, non-infringement, accuracy, security or availability, and any warranty that they will be error-free, uninterrupted, compatible with your stack or suitable for your requirements.",
      },
      {
        p: "You are responsible for reviewing, testing, securing and maintaining every End Product. Accessibility, privacy, security and performance features in the Pro Materials are aids, not a guarantee that your End Product complies with any law, regulation or standard, for example on accessibility, consumer protection, data protection, payments or AI. Starter Applications that handle accounts, payments, personal data or AI models are starting points: before you put one in front of users, you are responsible for its configuration, hardening, legal text, data handling and compliance. Legal pages in the starters are placeholders, not legal advice.",
      },
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    blocks: [
      { p: "To the fullest extent the law permits:" },
      {
        ol: [
          "we are **not liable** for any indirect, incidental, special, consequential, exemplary or punitive damages, or for loss of profits, revenue, business, goodwill, data or anticipated savings, or for the cost of replacements, however caused and on any legal theory, even if we were told they were possible;",
          "our **total aggregate liability** arising out of or related to this agreement and the Pro Materials is limited to the **amount you paid us for the licence in the 12 months before the event that gave rise to the claim**; and",
          "these limits apply to every kind of claim, including contract, tort (including negligence), statute and misrepresentation, and they continue to apply even if a remedy fails of its essential purpose.",
        ],
      },
      {
        p: "Nothing in this agreement excludes or limits liability that cannot be excluded or limited by law, including liability for fraud, or for death or personal injury caused by negligence. You acknowledge that the price reflects this allocation of risk.",
      },
    ],
  },
  {
    id: "termination",
    title: "Term and termination",
    blocks: [
      {
        ol: [
          "This agreement lasts for as long as you hold the licence, unless it is ended under this section. You may stop using the Pro Materials at any time, but no refund is due except under [[refunds]].",
          "**We may end it immediately by notice**, and revoke the Licence Key, if you materially breach it, including [[grant]], [[restrictions]], [[keys]], [[payment]] or [[compliance]]. If the breach can be fixed we may allow 7 days to fix it, but we are not required to.",
          "**When we end it for your breach**, all rights granted to you end. You must stop using the Pro Materials, delete every copy and derivative copy in your control, and confirm that in writing if we ask. End Products that you have already delivered to end users in compiled or deployed form may keep running but may not be updated with further Pro Materials. If the breach involved redistributing the Pro Materials or building a Prohibited Product, you must also withdraw that product from distribution. No refund is due.",
          "We may suspend a Licence Key at once while we investigate suspected key sharing, redistribution or abuse.",
          "If we withdraw the whole product, [[updates]] applies instead.",
          "[[ownership]], [[restrictions]], [[warranty]], [[liability]], [[compliance]], [[indemnity]], [[disputes]] and [[general]], and any right that arose before termination, survive termination.",
        ],
      },
    ],
  },
  {
    id: "compliance",
    title: "Compliance checks and enforcement",
    blocks: [
      {
        ol: [
          "If we reasonably suspect a breach, you will, within **7 business days** of a written request, give us reasonable information that confirms your compliance, including how many people have access to the Pro source and where it is stored. We may monitor use of the registry and of each Licence Key for abuse, including by IP address and request pattern.",
          "You acknowledge that a breach of [[grant]], [[restrictions]] or [[keys]] would cause us harm that money alone may not repair, and that we may seek **injunctive or other equitable relief** without proving damage and without posting a bond, in addition to our other remedies.",
          "If you publish Pro Materials in breach of this agreement, you will take them down promptly, and we may send takedown notices to hosts, registries and platforms.",
          "If it is decided that you breached [[grant]], [[restrictions]] or [[keys]], you will pay our reasonable costs of enforcement, including legal fees, to the extent the law allows.",
        ],
      },
    ],
  },
  {
    id: "indemnity",
    title: "Indemnity",
    blocks: [
      {
        p: "You will defend and indemnify us, our affiliates and their personnel against any claim, loss, liability, damages and reasonable costs (including legal fees) that arise from (a) your End Products and the content, data and marks in them, (b) your breach of this agreement or your misuse of the Pro Materials or a Licence Key, or (c) your violation of any law or of a third party's rights. We will tell you about the claim promptly and let you control the defence, but we may take part with our own counsel at our own cost, and you may not settle in a way that admits fault on our behalf or restricts us without our consent.",
      },
    ],
  },
  {
    id: "data",
    title: "Personal data",
    blocks: [
      {
        p: "When you buy, download or use the registry we process limited data, such as your email address, Licence Key, IP address, request logs and payment status, to provide the service, prevent abuse and meet legal duties. Our payment provider handles your payment details. Our privacy policy at ballmac.com/privacy explains more. If your End Product handles personal data, you are responsible for it: for your own notices, lawful basis, security, contracts with AI and other service providers, and compliance.",
      },
    ],
  },
  {
    id: "changes",
    title: "Changes to this agreement",
    blocks: [
      {
        p: "We may update this agreement from time to time. A change applies to purchases made after it and to versions of the Pro Materials first released after it. For existing licences we will give notice, by email or on the site, of any change that materially reduces your rights, and you may stop using later versions instead of accepting it. Versions you have already downloaded stay under the terms that applied when you obtained them.",
      },
    ],
  },
  {
    id: "disputes",
    title: "Governing law and disputes",
    blocks: [
      {
        ol: [
          "**Governing law.** This agreement, and any dispute arising out of or in connection with it, is governed by the laws of India, without regard to conflict-of-law rules.",
          "**Talk first.** Before starting a formal proceeding, each side will try in good faith to settle the dispute by email for 15 days after one of us gives the other written notice of it.",
          "**Arbitration.** Any dispute that is not settled in that time will be finally resolved by arbitration under the Arbitration and Conciliation Act, 1996. There will be a sole arbitrator, appointed by agreement or, failing agreement, as the Act provides. The seat of arbitration is New Delhi, India. The language is English, and hearings may be held by video. The award is final and binding, and may be enforced in any court that has jurisdiction.",
          "**Courts.** Despite paragraph 3, either side may ask any court of competent jurisdiction for urgent interim or injunctive relief, and we may bring a claim for unpaid fees or for infringement or misuse of the Pro Materials in any court of competent jurisdiction. The courts at New Delhi have exclusive jurisdiction over any matter that is not arbitrable and over court support for the arbitration.",
          "**Individual claims.** To the extent the law allows, you and we may bring claims against each other only in an individual capacity, and not as a plaintiff or class member in any class, collective or representative action.",
          "**Consumers.** If you are a consumer and the mandatory law of the country where you live gives you the right to bring a claim in your local courts, or to the benefit of mandatory consumer protections, nothing in this section removes that right.",
        ],
      },
    ],
  },
  {
    id: "general",
    title: "General",
    blocks: [
      {
        ol: [
          "**Assignment.** You may not assign or transfer this agreement or the licence, including by merger, sale of your business or change of control, without our written consent. We may assign it freely, including to a successor or an affiliate.",
          "**Export and sanctions.** You will not use the Pro Materials in breach of export-control or sanctions law, and you confirm that you are not on a sanctions list or in an embargoed region.",
          "**Entire agreement.** This agreement, the price and checkout terms shown when you buy, and the notices that come with each item are the whole agreement and replace earlier discussions. If a purchase order or your own terms conflict with it, this agreement prevails.",
          "**Severability and waiver.** If a provision cannot be enforced, it is limited to the minimum extent needed and the rest stays in force. Not enforcing a right is not a waiver of it.",
          "**No third-party rights.** Only you and we have rights under this agreement, except that our affiliates and licensors may enforce [[restrictions]], [[ownership]], [[warranty]] and [[liability]].",
          "**Independent parties.** Nothing in this agreement makes either of us the partner, agent or employee of the other.",
          "**Events beyond our control.** We are not responsible for delay or failure caused by events beyond our reasonable control, including outages of hosting, registry, network or payment providers.",
          "**Notices.** We may notify you by email at the address you bought with, or on the site. You can contact us at hello@ballmac.com.",
          "**Language.** If this agreement is translated, the English version controls.",
        ],
      },
    ],
  },
]

/** The number each section gets on the page, starting at 1. */
export const sectionNumber = (id: string): number => proLicence.findIndex((s) => s.id === id) + 1

/** Replaces every `[[id]]` with "section N". Throws for an id that does not exist, so a broken reference cannot be published. */
export function resolveRefs(text: string): string {
  return text.replace(/\[\[([a-z-]+)\]\]/g, (_, id: string) => {
    const n = sectionNumber(id)
    if (!n) throw new Error(`Pro licence: unknown section reference [[${id}]]`)
    return `section ${n}`
  })
}

/** Every text in the agreement, with references resolved, as plain text with `**` removed. Used for the plain-text copy and the tests. */
export function licenceText(): string {
  const strip = (s: string) => resolveRefs(s).replace(/\*\*/g, "")
  return proLicence
    .map((s, i) => {
      const body = s.blocks
        .map((b) => ("p" in b ? strip(b.p) : "ol" in b ? b.ol.map((t, n) => `${n + 1}. ${strip(t)}`).join("\n") : b.ul.map((t) => `- ${strip(t)}`).join("\n")))
        .join("\n\n")
      return `${i + 1}. ${s.title}\n\n${body}`
    })
    .join("\n\n")
}
