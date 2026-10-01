import { SnippetTabs } from "@/components/ballmac/snippet-tabs"

const snippets = [
  {
    label: "cURL",
    code: `curl https://api.example.com/v1/customers \\
  -X POST \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "email": "ada@example.com", "plan": "team" }'`,
  },
  {
    label: "JavaScript",
    code: `const res = await fetch("https://api.example.com/v1/customers", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email: "ada@example.com", plan: "team" }),
})
const customer = await res.json()`,
  },
  {
    label: "Python",
    code: `import os, requests

res = requests.post(
    "https://api.example.com/v1/customers",
    headers={"Authorization": f"Bearer {os.environ['API_KEY']}"},
    json={"email": "ada@example.com", "plan": "team"},
    timeout=10,
)
customer = res.json()`,
  },
  {
    label: "Go",
    code: `body := strings.NewReader(\`{"email":"ada@example.com","plan":"team"}\`)
req, _ := http.NewRequest("POST", "https://api.example.com/v1/customers", body)
req.Header.Set("Authorization", "Bearer "+os.Getenv("API_KEY"))
req.Header.Set("Content-Type", "application/json")

resp, err := http.DefaultClient.Do(req)`,
  },
]

export default function SnippetTabsDemo() {
  return (
    <div className="w-full max-w-xl">
      <SnippetTabs title="Create a customer" snippets={snippets} storageKey="ballmac-demo-language" />
    </div>
  )
}
