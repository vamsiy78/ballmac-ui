"use client"

/**
 * One line for mounting heavy previews. Tiles that scroll into view join the queue; it waits for the page's load event, then
 * lets one tile mount at a time, each in an idle moment, with a short pause between. A gallery that reveals ten live previews at
 * once would otherwise block the main thread for seconds on a phone; this spreads the same work out so taps and scrolling stay smooth.
 */
type Job = { run: () => void; cancelled: boolean }
const queue: Job[] = []
let running = false

const loaded = () => (document.readyState === "complete" ? Promise.resolve() : new Promise<void>((r) => window.addEventListener("load", () => r(), { once: true })))
const idle = () => new Promise<void>((r) => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(() => r(), { timeout: 1000 }) : setTimeout(r, 50)))
const pause = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

async function drain() {
  if (running) return
  running = true
  await loaded()
  while (queue.length) {
    const job = queue.shift()!
    if (job.cancelled) continue
    await idle()
    if (job.cancelled) continue
    job.run()
    await pause(120)
  }
  running = false
}

/** Queues `run`. Returns a function that cancels it (for unmounting before its turn). */
export function enqueueMount(run: () => void) {
  const job: Job = { run, cancelled: false }
  queue.push(job)
  void drain()
  return () => {
    job.cancelled = true
  }
}
