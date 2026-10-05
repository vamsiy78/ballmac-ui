import "server-only"

// Minimal Resend REST client for server routes. Uses fetch directly so the site needs no SDK. The API key never leaves the server.
// RESEND_API_URL exists for tests, which point it at a local stand-in.
export class ResendError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(`Resend ${status}: ${message}`)
  }
}

export async function resend<T = unknown>(path: string, options: { method?: "GET" | "POST"; body?: unknown; idempotencyKey?: string } = {}): Promise<T> {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new ResendError(0, "RESEND_API_KEY is not set")
  let res: Response
  try {
    res = await fetch(`${process.env.RESEND_API_URL ?? "https://api.resend.com"}${path}`, {
      method: options.method ?? "GET",
      headers: {
        Authorization: `Bearer ${key}`,
        ...(options.body !== undefined && { "Content-Type": "application/json" }),
        ...(options.idempotencyKey && { "Idempotency-Key": options.idempotencyKey }),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.timeout(15_000),
    })
  } catch (err) {
    throw new ResendError(0, err instanceof Error ? err.message : "network error")
  }
  const data = (await res.json().catch(() => ({}))) as { message?: string }
  if (!res.ok) throw new ResendError(res.status, data.message ?? "unknown error")
  return data as T
}
