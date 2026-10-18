import { z } from "zod"

/**
 * The Ballmac UI item metadata contract. Every registry item has one `<name>.meta.ts`;
 * the registry build, the website, search, llms.txt and MCP all read it.
 * Changing a field's meaning is a breaking change: bump SCHEMA_VERSION.
 */
export const SCHEMA_VERSION = 1

export const categories = [
  "primitives",
  "macos",
  "devices",
  "backgrounds",
  "text",
  "motion",
  "layout",
  "navigation",
  "forms",
  "data-display",
  "feedback",
  "marketing",
  "ai",
  "developer",
  "saas",
  "dashboards",
  "blocks",
  "templates",
  "foundation",
] as const

export const templateKinds = ["marketing", "application", "content", "specialty"] as const

export const blockCategories = [
  "hero",
  "features",
  "pricing",
  "testimonials",
  "logo-cloud",
  "faq",
  "cta",
  "footer",
  "header",
  "auth",
  "dashboard",
  "settings",
  "ai-chat",
  "billing",
  "stats",
  "team",
  "blog",
  "changelog",
  "contact",
  "careers",
  "comparison",
  "newsletter",
  "error",
  "onboarding",
  "app-shell",
  "mail",
  "kanban",
  "calendar",
  "showcase",
  "download",
  "devices",
  "ecommerce",
  "desktop",
  "agents",
  "chat",
  "profile",
  "help",
  "search",
  "notifications",
  "upload",
  "developer",
  "about",
  "trust",
  "gallery",
  "tasks",
  "leaderboard",
  "gantt",
  "orgchart",
  "casestudy",
  "integrations",
  "status",
  "calculator",
  "survey",
  "directory",
  "waitlist",
  "locations",
  "reviews",
  "funnel",
  "experiments",
  "course",
  "invoice",
  "import",
  "retention",
  "event",
  "quiz",
] as const

// Registry item types Ballmac publishes (a subset of the shadcn spec).
export const itemTypes = [
  "registry:ui",
  "registry:component",
  "registry:block",
  "registry:page",
  "registry:hook",
  "registry:lib",
  "registry:theme",
  "registry:style",
  "registry:font",
  "registry:file",
] as const

/** Item names are a permanent public contract: kebab-case, no namespace. */
const itemName = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "kebab-case, e.g. magnetic-button or hero-1")

/**
 * A registry dependency: another Ballmac item by bare name ("button"), or a shadcn
 * item ("shadcn:dialog"). The build turns these into URLs or @ballmac/… names.
 */
const registryDependency = z.string().regex(/^(shadcn:)?[a-z0-9]+(-[a-z0-9]+)*$/)

const file = z.object({
  /** Path of the source file, relative to registry/ballmac. It is also the install path. */
  path: z.string(),
  type: z.enum(itemTypes).optional(),
})

const example = z.object({
  name: itemName,
  title: z.string(),
  /** Path relative to registry/examples. */
  file: z.string(),
  description: z.string().optional(),
})

/** The states an item can show. `ready` is the normal view and is never listed. */
export const stateIds = ["loading", "empty", "error", "submitting", "success", "disabled", "expired", "offline"] as const

const itemState = z.object({
  id: z.enum(stateIds),
  /** Short label for the preview switch on the item's page. */
  title: z.string().min(2).max(30),
  /** The example that shows it: one of this item's own examples. */
  example: itemName,
  /** How you get this state, usually a prop: `state="loading"`. */
  trigger: z.string().min(3).max(120),
  /** What the state shows and what a person can do in it. */
  note: z.string().max(200).optional(),
})

export const sourceNotice = z.object({
  name: z.string(),
  url: z.string().url(),
  license: z.enum(["MIT", "ISC", "BSD-2-Clause", "BSD-3-Clause", "Apache-2.0"]),
  copyright: z.string(),
  modified: z.boolean().default(true),
})

export const itemMeta = z
  .object({
    name: itemName,
    type: z.enum(itemTypes),
    title: z.string().min(1),
    /** One or two sentences. Shown in listings, search, the registry and MCP. */
    description: z.string().min(20).max(240),
    category: z.enum(categories),
    blockCategory: z.enum(blockCategories).optional(),
    /** Templates only: the group a template belongs to in the gallery. */
    templateKind: z.enum(templateKinds).optional(),
    /** Templates only: every page the template installs, each previewed by one of its examples. */
    templatePages: z.array(z.object({ title: z.string(), example: z.string(), path: z.string().optional() })).default([]),
    /** Templates only: Google Fonts the template loads, e.g. "Instrument Serif". */
    fonts: z.array(z.string()).default([]),
    tier: z.enum(["free", "pro"]).default("free"),
    /** Showpiece items lead the catalog and home page. */
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    files: z.array(file).default([]),
    /** npm packages the installed files import, with a major range, e.g. "motion@^12". */
    dependencies: z.array(z.string()).default([]),
    devDependencies: z.array(z.string()).default([]),
    registryDependencies: z.array(registryDependency).default([]),
    examples: z.array(example).default([]),
    /** Every state this item can show beyond ready, each with an example. Data and form items list them; see `statesNone` for the rest. */
    states: z.array(itemState).default([]),
    /** Items with nothing to load, submit or fail say why, so a missing `states` is never an oversight. */
    statesNone: z.string().min(10).max(160).optional(),
    cssVars: z
      .object({
        theme: z.record(z.string()).optional(),
        light: z.record(z.string()).optional(),
        dark: z.record(z.string()).optional(),
      })
      .optional(),
    css: z.record(z.any()).optional(),
    ai: z
      .object({
        summary: z.string(),
        whenToUse: z.array(z.string()).default([]),
        whenNotToUse: z.array(z.string()).default([]),
        composesWith: z.array(itemName).default([]),
        a11y: z.array(z.object({ keys: z.string(), action: z.string() })).default([]),
        customization: z.array(z.string()).default([]),
      })
      .optional(),
    /** Required when any code came from outside Ballmac. */
    source: sourceNotice.optional(),
    /** Notes shown by the shadcn CLI after install. */
    docs: z.string().optional(),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    /** ISO date of the last meaningful change. */
    updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    /**
     * What changed in each version after the first, newest first. `ballmac outdated` and `ballmac update` show these notes, so write
     * them for someone who customised the file: what behaviour changed and whether props were added, renamed or removed.
     * The first entry must match `version`.
     */
    changelog: z.array(z.object({ version: z.string().regex(/^\d+\.\d+\.\d+$/), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), note: z.string().min(10).max(300), breaking: z.boolean().default(false) })).default([]),
  })
  .superRefine((item, ctx) => {
    if (item.changelog.length && item.changelog[0]!.version !== item.version) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `the newest changelog entry (${item.changelog[0]!.version}) must match version (${item.version})`, path: ["changelog"] })
    }
    if (item.states.length && item.statesNone) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "an item lists states or says statesNone, not both", path: ["statesNone"] })
    }
    const exampleNames = new Set(item.examples.map((e) => e.name))
    const seen = new Set<string>()
    item.states.forEach((s, i) => {
      if (!exampleNames.has(s.example)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `state "${s.id}" points at example "${s.example}", which is not one of this item's examples`, path: ["states", i, "example"] })
      if (seen.has(s.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `state "${s.id}" is listed twice`, path: ["states", i, "id"] })
      seen.add(s.id)
    })
    if (item.category === "blocks" && !item.blockCategory) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "blocks need a blockCategory", path: ["blockCategory"] })
    }
    if (item.category === "templates" && !item.templateKind) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "templates need a templateKind", path: ["templateKind"] })
    }
    if (item.type !== "registry:theme" && item.type !== "registry:style" && item.type !== "registry:font" && item.files.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "items must ship at least one file", path: ["files"] })
    }
  })

export type ItemMeta = z.output<typeof itemMeta>
export type ItemMetaInput = z.input<typeof itemMeta>
export type Category = (typeof categories)[number]
