import { createRequire } from "node:module"
import { describe, expect, it } from "vitest"

const require = createRequire(import.meta.url)
const loader = require("../scripts/glsl-minify-loader.cjs") as ((source: string) => string) & { minify: (s: string) => string }

describe("glsl minify loader", () => {
  it("strips comments and layout but keeps directives on their own lines", () => {
    const out = loader.minify(`
      #define N 3
      // a comment
      uniform vec4 uPlanes[N]; /* block */
      void main() {
        float a = 1.0 / 2.0; // trailing
        if (a > 0.0) { discard; }
      }`)
    expect(out).toBe("#define N 3\nuniform vec4 uPlanes[N];void main(){float a = 1.0 / 2.0;if(a > 0.0){discard;}}")
  })

  it("rewrites only template literals that declare a shader main", () => {
    const src = "const A = `\n  void main() {\n    gl_Position = vec4(0.0);\n  }\n`\nconst B = `not a shader,\n  just text`\nconst C = `void main() { ${1} }`"
    const out = loader(src)
    expect(out).toContain("`\nvoid main(){gl_Position = vec4(0.0);}\n`")
    expect(out).toContain("`not a shader,\n  just text`")
    expect(out).toContain("`void main() { ${1} }`")
  })

  it("leaves the text of a directive alone", () => {
    expect(loader.minify("#define SQ(x) (x * x)\nvoid main() { float y = SQ(2.0); }")).toBe("#define SQ(x) (x * x)\nvoid main(){float y = SQ(2.0);}")
  })

  it("is stable when run twice", () => {
    const once = loader("const S = `\n  uniform float t;\n  void main() { float x = t; }\n`")
    expect(loader(once)).toBe(once)
  })
})
