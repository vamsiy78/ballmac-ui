import * as React from "react"
import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { isBusy, isEmptyValue, stateOf, useResource } from "@/lib/ballmac/use-resource"

const deferred = <T,>() => {
  let resolve!: (v: T) => void
  let reject!: (e: unknown) => void
  const promise = new Promise<T>((res, rej) => ((resolve = res), (reject = rej)))
  return { promise, resolve, reject }
}

describe("isEmptyValue and isBusy", () => {
  it("counts the usual suspects as empty", () => {
    for (const v of [null, undefined, [], {}, "", "  ", new Map(), new Set()]) expect(isEmptyValue(v), String(v)).toBe(true)
    for (const v of [[1], { a: 1 }, "x", 0, false, new Map([[1, 1]])]) expect(isEmptyValue(v), String(v)).toBe(false)
  })
  it("treats loading and submitting as busy", () => {
    expect(["loading", "submitting"].every((s) => isBusy(s as never))).toBe(true)
    expect(["ready", "empty", "error", "success"].some((s) => isBusy(s as never))).toBe(false)
  })
})

describe("stateOf", () => {
  it("maps TanStack Query and SWR results", () => {
    expect(stateOf({ isPending: true })).toBe("loading")
    expect(stateOf({ isLoading: true })).toBe("loading")
    expect(stateOf({ isError: true, error: new Error("x") })).toBe("error")
    expect(stateOf({ error: new Error("x") })).toBe("error")
    expect(stateOf({ data: [1] })).toBe("ready")
    expect(stateOf({ data: [] })).toBe("empty")
    expect(stateOf({ data: undefined, isPending: false })).toBe("empty")
  })
  it("keeps showing data when a refetch fails but data is there, and honours a custom isEmpty", () => {
    expect(stateOf({ data: [1], error: new Error("x") })).toBe("ready")
    expect(stateOf({ data: { total: 0 } }, (d) => d?.total === 0)).toBe("empty")
  })
})

describe("useResource", () => {
  it("goes loading to ready", async () => {
    const d = deferred<string[]>()
    const { result } = renderHook(() => useResource(() => d.promise))
    expect(result.current.state).toBe("loading")
    await act(async () => d.resolve(["a"]))
    expect(result.current).toMatchObject({ state: "ready", data: ["a"] })
  })

  it("goes to empty and to error", async () => {
    const empty = renderHook(() => useResource(() => Promise.resolve([] as string[])))
    await waitFor(() => expect(empty.result.current.state).toBe("empty"))
    const failed = renderHook(() => useResource(() => Promise.reject(new Error("503"))))
    await waitFor(() => expect(failed.result.current.state).toBe("error"))
    expect((failed.result.current.error as Error).message).toBe("503")
  })

  it("retries from the error state, showing loading again", async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new Error("down")).mockResolvedValueOnce([1])
    const { result } = renderHook(() => useResource(fetcher))
    await waitFor(() => expect(result.current.state).toBe("error"))
    act(() => result.current.retry())
    expect(result.current.state).toBe("loading")
    await waitFor(() => expect(result.current.state).toBe("ready"))
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it("never lets a slow old answer overwrite a newer one", async () => {
    const slow = deferred<string>()
    const fast = deferred<string>()
    const calls = [slow, fast]
    let n = 0
    const { result, rerender } = renderHook(({ id }) => useResource(() => calls[n++]!.promise, { deps: [id] }), { initialProps: { id: 1 } })
    rerender({ id: 2 })
    await act(async () => fast.resolve("new"))
    await act(async () => slow.resolve("old"))
    expect(result.current.data).toBe("new")
  })

  it("aborts the request when it unmounts", async () => {
    let signal!: AbortSignal
    const { unmount } = renderHook(() =>
      useResource((s) => {
        signal = s
        return new Promise<string>(() => {})
      })
    )
    expect(signal.aborted).toBe(false)
    unmount()
    expect(signal.aborted).toBe(true)
  })

  it("waits while disabled, and does not refetch on every render with an inline fetcher", async () => {
    const fetcher = vi.fn().mockResolvedValue([1])
    const { result, rerender } = renderHook(({ enabled }) => useResource((s) => fetcher(s), { enabled }), { initialProps: { enabled: false } })
    expect(fetcher).not.toHaveBeenCalled()
    rerender({ enabled: true })
    await waitFor(() => expect(result.current.state).toBe("ready"))
    rerender({ enabled: true })
    rerender({ enabled: true })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it("setData replaces the data and keeps the state in step", async () => {
    const { result } = renderHook(() => useResource(() => Promise.resolve([1])))
    await waitFor(() => expect(result.current.state).toBe("ready"))
    act(() => result.current.setData([]))
    expect(result.current.state).toBe("empty")
    act(() => result.current.setData([2, 3]))
    expect(result.current).toMatchObject({ state: "ready", data: [2, 3] })
  })

  it("accepts a custom isEmpty", async () => {
    const { result } = renderHook(() => useResource(() => Promise.resolve({ total: 0 }), { isEmpty: (d) => d.total === 0 }))
    await waitFor(() => expect(result.current.state).toBe("empty"))
  })
})
