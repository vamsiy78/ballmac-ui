// Tiny static file server for the install smoke test (runs as its own process).
import { readFileSync } from "node:fs"
import { createServer } from "node:http"
import { join } from "node:path"

const [root, port] = process.argv.slice(2)
createServer((req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname)
    if (path.includes("..")) throw new Error("bad path")
    res.writeHead(200, { "content-type": "application/json" }).end(readFileSync(join(root, path)))
  } catch {
    res.writeHead(404, { "content-type": "application/json" }).end('{"error":"not_found"}')
  }
}).listen(Number(port), "127.0.0.1")
