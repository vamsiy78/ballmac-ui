/**
 * Extracts a props table from a component file without running the type checker:
 * - properties declared in `type <Name>Props = … & { … }` literals (with JSDoc)
 * - cva variants (`variants` keys and values, `defaultVariants`)
 * - defaults from the component's destructured parameters
 * Inherited HTML attributes are intentionally omitted.
 */
import { Node, Project, SyntaxKind } from "ts-morph"

export type PropDoc = { name: string; type: string; required: boolean; default?: string; description?: string }
export type ComponentDoc = { component: string; props: PropDoc[] }

const project = new Project({ useInMemoryFileSystem: true, compilerOptions: { jsx: 4 } })

export function extractProps(code: string, fileName = "c.tsx"): ComponentDoc[] {
  const sf = project.createSourceFile(fileName, code, { overwrite: true })

  // cva variants by variable name.
  const variants = new Map<string, PropDoc[]>()
  for (const decl of sf.getVariableDeclarations()) {
    const call = decl.getInitializerIfKind(SyntaxKind.CallExpression)
    if (!call || call.getExpression().getText() !== "cva") continue
    const config = call.getArguments()[1]
    if (!config || !Node.isObjectLiteralExpression(config)) continue
    const defaults = new Map<string, string>()
    const dv = config.getProperty("defaultVariants")
    if (dv && Node.isPropertyAssignment(dv)) {
      const obj = dv.getInitializer()
      if (obj && Node.isObjectLiteralExpression(obj))
        for (const p of obj.getProperties()) if (Node.isPropertyAssignment(p)) defaults.set(p.getName(), p.getInitializer()?.getText() ?? "")
    }
    const v = config.getProperty("variants")
    const docs: PropDoc[] = []
    if (v && Node.isPropertyAssignment(v)) {
      const obj = v.getInitializer()
      if (obj && Node.isObjectLiteralExpression(obj))
        for (const p of obj.getProperties()) {
          if (!Node.isPropertyAssignment(p)) continue
          const values = p.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression)?.getProperties().map((x) => (Node.isPropertyAssignment(x) ? `"${x.getName().replace(/^["']|["']$/g, "")}"` : "")) ?? []
          docs.push({ name: p.getName(), type: values.filter(Boolean).join(" | "), required: false, default: defaults.get(p.getName()) })
        }
    }
    variants.set(decl.getName(), docs)
  }

  const out: ComponentDoc[] = []
  for (const alias of sf.getTypeAliases()) {
    const name = alias.getName()
    if (!name.endsWith("Props")) continue
    const component = name.slice(0, -"Props".length)
    const props: PropDoc[] = []
    const typeNode = alias.getTypeNode()
    if (!typeNode) continue
    const literals = [typeNode, ...typeNode.getDescendantsOfKind(SyntaxKind.TypeLiteral)].filter((n) => Node.isTypeLiteral(n))
    for (const lit of literals)
      for (const m of lit.getMembers()) {
        if (!Node.isPropertySignature(m)) continue
        props.push({
          name: m.getName(),
          type: (m.getTypeNode()?.getText() ?? "unknown").replace(/\s+/g, " "),
          required: !m.hasQuestionToken(),
          description: m.getJsDocs().map((d) => d.getDescription().trim()).join(" ") || undefined,
        })
      }
    for (const ref of typeNode.getDescendantsOfKind(SyntaxKind.TypeQuery)) {
      const v = variants.get(ref.getExprName().getText())
      if (v) props.push(...v)
    }
    // Defaults from `function Component({ a = 1, … })`.
    const fn = sf.getFunction(component)
    const binding = fn?.getParameters()[0]?.getNameNode()
    if (binding && Node.isObjectBindingPattern(binding))
      for (const el of binding.getElements()) {
        const init = el.getInitializer()?.getText()
        const prop = props.find((p) => p.name === el.getName())
        if (init && prop && !prop.default) prop.default = init
      }
    if (props.length) out.push({ component, props })
  }
  return out
}
