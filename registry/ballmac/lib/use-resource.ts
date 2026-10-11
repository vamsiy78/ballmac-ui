// Ballmac UI: Use Resource. https://ui.ballmac.com/docs/states
// Turns a data fetch into the states every Ballmac block understands: loading, ready, empty and error.
import * as React from "react"

/**
 * What a block is showing. `ready` is the normal view. Forms add `submitting` (the request is in flight) and `success`
 * (it went through); data views add `loading`, `empty` and `error`.
 */
export type BlockState = "ready" | "loading" | "empty" | "error" | "submitting" | "success"

/** Whether something is in flight, so a region can set `aria-busy`. */
export const isBusy = (state: BlockState) => state === "loading" || state === "submitting"

/** Empty arrays, empty objects with no keys, empty strings, null and undefined count as empty. */
export function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === "string") return value.trim() === ""
  if (value instanceof Map || value instanceof Set) return value.size === 0
  if (typeof value === "object") return Object.keys(value as object).length === 0
  return false
}

type QueryLike<T> = {
  data?: T
  /** TanStack Query's `isPending`, or SWR's `isLoading`. */
  isPending?: boolean
  isLoading?: boolean
  isError?: boolean
  error?: unknown
}

/**
 * Maps the result of TanStack Query, SWR or your own fetch onto a block state:
 *
 *   const query = useQuery(...)
 *   <Mail1 state={stateOf(query)} messages={query.data} />
 */
export function stateOf<T>(query: QueryLike<T>, isEmpty: (data: T | undefined) => boolean = isEmptyValue): BlockState {
  if (query.isError || (query.error !== undefined && query.error !== null && query.data === undefined)) return "error"
  if (query.isPending || query.isLoading) return "loading"
  return isEmpty(query.data) ? "empty" : "ready"
}

export type Resource<T> = {
  state: BlockState
  data: T | undefined
  error: unknown
  /** Fetches again, showing the loading state. */
  retry: () => void
  /** Replaces the data you have, for example after an optimistic edit. Keeps `ready` or `empty` in step. */
  setData: (next: T) => void
}

type ResourceOptions<T> = {
  /** What counts as no data. Defaults to empty arrays, objects, strings, null and undefined. */
  isEmpty?: (data: T) => boolean
  /** Pass false to wait, for example until a user id is known. */
  enabled?: boolean
  /** Fetch again when any of these change. */
  deps?: React.DependencyList
}

/**
 * A small fetch state machine: it starts in `loading`, then becomes `ready`, `empty` or `error`, and `retry()` goes round again.
 * A request that is replaced or unmounted is aborted, and a slow older answer can never overwrite a newer one.
 *
 *   const mail = useResource((signal) => fetch("/api/mail", { signal }).then((r) => r.json()))
 *   <Mail1 state={mail.state} messages={mail.data} onRetry={mail.retry} />
 */
export function useResource<T>(fetcher: (signal: AbortSignal) => Promise<T>, options: ResourceOptions<T> = {}): Resource<T> {
  const { isEmpty = isEmptyValue, enabled = true, deps = [] } = options
  const [attempt, setAttempt] = React.useState(0)
  const [result, setResult] = React.useState<{ status: "pending" | "done" | "failed"; data?: T; error?: unknown }>({ status: "pending" })
  // the latest fetcher without making it a dependency, so an inline arrow does not refetch on every render
  const latest = React.useRef(fetcher)
  latest.current = fetcher

  React.useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    setResult((r) => (r.status === "pending" ? r : { status: "pending", data: r.data }))
    latest.current(controller.signal).then(
      (data) => !controller.signal.aborted && setResult({ status: "done", data }),
      (error) => !controller.signal.aborted && setResult({ status: "failed", error })
    )
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, attempt, ...deps])

  const retry = React.useCallback(() => setAttempt((n) => n + 1), [])
  const setData = React.useCallback((next: T) => setResult({ status: "done", data: next }), [])
  const state: BlockState = result.status === "pending" ? "loading" : result.status === "failed" ? "error" : isEmpty(result.data as T) ? "empty" : "ready"
  return { state, data: result.data, error: result.error, retry, setData }
}
