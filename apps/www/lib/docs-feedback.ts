/** "Was this page helpful?" at the end of every docs page: what the browser sends, and the email the team gets for a "no" with a comment. */
export const FEEDBACK_LIMITS = { page: 200, comment: 1000 } as const

export type DocsFeedback = { page: string; helpful: boolean; comment?: string }

/** The feedback in a request body, or null when it is not valid. Only docs pages can be rated, and a comment only goes with a "no". */
export function parseFeedback(raw: unknown): DocsFeedback | null {
  if (!raw || typeof raw !== "object") return null
  const { page, helpful, comment } = raw as Record<string, unknown>
  if (typeof page !== "string" || !/^\/docs(\/[a-z0-9-]+)*$/.test(page) || page.length > FEEDBACK_LIMITS.page) return null
  if (typeof helpful !== "boolean") return null
  const text = typeof comment === "string" ? comment.trim().slice(0, FEEDBACK_LIMITS.comment) : ""
  return { page, helpful, ...(!helpful && text ? { comment: text } : {}) }
}

export function feedbackEmail(f: DocsFeedback, siteUrl: string) {
  return {
    subject: `Docs feedback: ${f.page}`,
    text: `Someone said ${f.page} was not helpful.\n\n${f.comment ?? "(no comment)"}\n\n${siteUrl}${f.page}\n`,
  }
}
