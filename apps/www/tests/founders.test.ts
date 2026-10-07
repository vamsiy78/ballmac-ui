import { describe, expect, it } from "vitest"
import { cleanName, maskKey } from "../lib/founders"

describe("founders", () => {
  it("strips markup and control characters from names", () => {
    expect(cleanName("Maya <b>Okafor</b>")).toBe("Maya Okafor")
    expect(cleanName("  Sam\n  Lee ")).toBe("Sam Lee")
    expect(cleanName(42)).toBe("")
    expect(cleanName("x".repeat(100))).toHaveLength(60)
  })
  it("masks the middle of a key", () => {
    expect(maskKey("FOUNDER-KEY-1")).toBe("FOUN••••••••EY-1")
    expect(maskKey("short")).toBe("•••••")
  })
})
