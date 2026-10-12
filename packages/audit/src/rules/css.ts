/** motion/endless-decorative for style sheets: an endless CSS animation in a file that never mentions reduced motion. */
export function cssMotionFindings(text: string): { line: number; column: number; message: string }[] {
  if (/prefers-reduced-motion/.test(text)) return []
  const out: { line: number; column: number; message: string }[] = []
  const lines = text.split("\n")
  lines.forEach((l, i) => {
    if (/^\s*(?:\/\*|\*|\/\/)/.test(l)) return
    const loops = /\banimation\s*:[^;]*\binfinite\b/.test(l) || /\banimation-iteration-count\s*:\s*infinite\b/.test(l)
    if (!loops) return
    // Spinners and other status indicators are named as such and are allowed to keep moving.
    if (/spin|loader|loading|progress|indeterminate|caret|cursor/i.test(l)) return
    // A loop whose play state comes from a variable (the Ballmac convention: animation-play-state: var(--bm-ambient-state)) can be held still by the theme.
    let end = i
    while (end < lines.length - 1 && !/}/.test(lines[end]!)) end++
    if (lines.slice(Math.max(0, i - 6), end + 1).some((x) => /animation-play-state\s*:\s*(?:var\(|paused)/.test(x))) return
    out.push({ line: i + 1, column: l.search(/\S/) + 1, message: "An endless CSS animation runs in a file that never mentions prefers-reduced-motion." })
  })
  return out
}
