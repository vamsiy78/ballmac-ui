/**
 * A Turbopack loader that shrinks the GLSL shaders written as template literals in the private Pro registry files, for the public site's bundles only.
 *
 * The preview pages of Pro blocks must run in the browser, so their compiled code is public; JavaScript is minified, but a shader is a string, and strings survive
 * minification untouched. This strips comments and line breaks from them (keeping `#` directives on their own lines), the same level of protection the minifier gives
 * the surrounding JavaScript. It changes nothing the buyer gets: the registry JSON and the source viewer use the original files, and this runs only inside the Next build.
 */

const tighten = (code) => code.replace(/[ \t]+/g, " ").replace(/ ?([{}();,]) ?/g, "$1").trim()

/** GLSL source with comments and layout removed. A line starting with `#` stays a line of its own, untouched, because a directive ends at the line break. */
function minify(source) {
  const parts = []
  let code = ""
  for (const raw of source.replace(/\/\*[\s\S]*?\*\//g, "").split("\n")) {
    const line = raw.replace(/\/\/.*$/, "").trim()
    if (!line) continue
    if (line.startsWith("#")) {
      if (code) parts.push(tighten(code))
      code = ""
      parts.push(line)
    } else code += `${line} `
  }
  if (code) parts.push(tighten(code))
  return parts.join("\n")
}

/** Rewrites every template literal that holds a shader (it declares `void main`). */
function loader(source) {
  return source.replace(/`([^`]*)`/g, (match, body) => (/\bvoid\s+main\s*\(/.test(body) && !body.includes("${") ? `\`\n${minify(body)}\n\`` : match))
}

module.exports = loader
module.exports.minify = minify
