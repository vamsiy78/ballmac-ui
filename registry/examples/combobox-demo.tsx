"use client";
import { Combobox, type ComboboxOption } from "@/components/ballmac/combobox";
import {
  Field,
  FieldDescription,
  FieldLabel,
  useFieldControl,
} from "@/components/ballmac/field";
const frameworks: ComboboxOption[] = [
  { value: "next", label: "Next.js", description: "React framework with routing", keywords: ["react"] },
  { value: "remix", label: "Remix", description: "Web standards, nested routes" },
  { value: "astro", label: "Astro", description: "Content sites with islands" },
  { value: "sveltekit", label: "SvelteKit", description: "Svelte application framework", keywords: ["svelte"] },
  { value: "nuxt", label: "Nuxt", description: "Vue framework", keywords: ["vue"] },
  { value: "solid", label: "SolidStart", description: "Fine-grained reactivity", disabled: true },
];
export default function ComboboxDemo() {
  return (
    <Field className="w-full max-w-sm">
      <FieldLabel>Framework</FieldLabel>
      <ComboboxField />
      <FieldDescription>Search by name or ecosystem, like “vue”.</FieldDescription>
    </Field>
  );
}
function ComboboxField() {
  const { id, ...control } = useFieldControl();
  return (
    <Combobox
      id={id}
      {...control}
      options={frameworks}
      defaultValue="next"
      placeholder="Select a framework"
      searchPlaceholder="Search frameworks"
      clearable
    />
  );
}
