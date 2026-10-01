import { SnippetTabs } from "@/components/ballmac/snippet-tabs"

export default function SnippetTabsVariables() {
  return (
    <div className="w-full max-w-xl">
      <SnippetTabs
        lineNumbers
        title="Your first request"
        variables={{ api_key: "sk_test_4eC39HqLyjWDarjtT1zdp7dc", project: "prj_8f3a1c92e7" }}
        snippets={[
          {
            label: "cURL",
            code: `curl https://api.example.com/v1/projects/{{project}}/deploys \\
  -H "Authorization: Bearer {{api_key}}"`,
          },
          {
            label: "JavaScript",
            code: `const res = await fetch("https://api.example.com/v1/projects/{{project}}/deploys", {
  headers: { Authorization: "Bearer {{api_key}}" },
})
const deploys = await res.json()
console.log(deploys.length)`,
          },
        ]}
      />
    </div>
  )
}
