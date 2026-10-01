import { describe, expect, it } from "vitest";
import { highlightLines, languageFromName, tokenize } from "@/lib/ballmac/highlight";

const types = (code: string, lang: Parameters<typeof tokenize>[1]) => tokenize(code, lang).map((t) => `${t.type}:${t.text}`);

describe("highlight", () => {
  it("tokenizes JSON keys apart from string values", () => {
    const t = tokenize('{"a": "x", "n": 1, "ok": true}', "json");
    expect(t.find((x) => x.text === '"a"')?.type).toBe("property");
    expect(t.find((x) => x.text === '"x"')?.type).toBe("string");
    expect(t.find((x) => x.text === "1")?.type).toBe("number");
    expect(t.find((x) => x.text === "true")?.type).toBe("literal");
  });
  it("marks shell programs, flags, variables and URLs", () => {
    const t = types('curl -X POST https://api.example.com/v1 -H "A: $B"', "bash");
    expect(t).toContain("function:curl");
    expect(t).toContain("flag:-X");
    expect(t).toContain("string:https://api.example.com/v1");
    expect(t).toContain('string:"A: $B"');
  });
  it("keeps a shell command going across a trailing backslash", () => {
    const t = tokenize("curl \\\n  -H x", "bash");
    expect(t.filter((x) => x.type === "function").map((x) => x.text)).toEqual(["curl"]);
  });
  it("finds keywords, calls, strings and comments in JavaScript", () => {
    const t = types('const x = await fetch("/a") // go', "typescript");
    expect(t).toContain("keyword:const");
    expect(t).toContain("keyword:await");
    expect(t).toContain("function:fetch");
    expect(t).toContain('string:"/a"');
    expect(t).toContain("comment:// go");
  });
  it("handles python, go, http and env", () => {
    expect(types("def f(x): return None", "python")).toEqual(expect.arrayContaining(["keyword:def", "function:f", "keyword:return", "literal:None"]));
    expect(types("func main() {}", "go")).toEqual(expect.arrayContaining(["keyword:func", "function:main"]));
    expect(types("POST /v1/x HTTP/1.1", "http")).toEqual(expect.arrayContaining(["keyword:POST", "function:/v1/x"]));
    expect(types('# note\nKEY="v"', "env")).toEqual(expect.arrayContaining(["comment:# note\n", 'string:"v"']));
  });
  it("groups tokens by line and never loses text", () => {
    const code = 'a = 1\n"""doc\nmore"""\nb';
    const lines = highlightLines(code, "python");
    expect(lines.map((l) => l.map((t) => t.text).join("")).join("\n")).toBe(code);
    expect(lines).toHaveLength(4);
  });
  it("guesses a language from a name", () => {
    expect(languageFromName("cURL")).toBe("bash");
    expect(languageFromName("app.tsx")).toBe("typescript");
    expect(languageFromName("Python")).toBe("python");
    expect(languageFromName(".env.local")).toBe("env");
    expect(languageFromName("Rust")).toBe("text");
  });
});
