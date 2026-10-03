"use client"

// Last resort when the root layout itself fails: no site components, no styles that could fail with it.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, textAlign: "center", padding: "0 1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Something went wrong</h1>
          <p style={{ color: "#555", margin: "0.75rem 0 1.5rem" }}>Please try again in a moment.</p>
          <button onClick={reset} style={{ font: "inherit", padding: "0.6rem 1.2rem", borderRadius: 999, border: "1px solid #111", background: "#111", color: "#fff", cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
