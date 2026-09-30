import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "form",
  type: "registry:ui",
  title: "Form",
  description:
    "React Hook Form wired to Ballmac Field: one FormField renders label, control, description and error with ids, aria-invalid and aria-describedby linked, plus a pending submit button.",
  category: "forms",
  tags: ["form", "validation", "react-hook-form", "field"],
  files: [{ path: "components/form.tsx" }],
  dependencies: ["react-hook-form@^7"],
  registryDependencies: ["shadcn:utils", "button", "field"],
  examples: [
    { name: "form-demo", title: "Sign up", file: "form-demo.tsx" },
    { name: "form-states", title: "Pending submit", file: "form-states.tsx" },
  ],
  ai: {
    summary:
      "const form = useForm(); <Form form onSubmit><FormField name label render={(props) => <Input {...props}/>}/><FormSubmit/></Form>. Use rules or a resolver for validation.",
    whenToUse: ["Any form with client validation", "Forms that need per-field errors announced"],
    whenNotToUse: ["A single uncontrolled input; use field", "Server actions without client state"],
    composesWith: ["field", "input", "checkbox", "select"],
    a11y: [
      { keys: "Enter", action: "Submits; focus moves to the first invalid control" },
      { keys: "Screen readers", action: "Labels, hints and errors are linked; errors use role alert" },
    ],
    customization: ["rules or resolver", "orientation horizontal for checkboxes", "pendingText on FormSubmit", "description and required"],
  },
  source: {
    name: "shadcn/ui Form",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
