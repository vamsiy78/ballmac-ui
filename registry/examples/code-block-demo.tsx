import { CodeBlock } from "@/components/ballmac/code-block"

const code = `import { Button } from "@/components/ballmac/button"

export function SaveButton({ saving }: { saving: boolean }) {
  return <Button loading={saving}>Save changes</Button>
}`

export default function CodeBlockDemo() {
  return <CodeBlock className="w-full max-w-xl" filename="components/save-button.tsx" language="tsx" code={code} lineNumbers highlight={[4]} />
}
