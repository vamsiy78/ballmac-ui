import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "import-1",
  type: "registry:block",
  title: "Import 1: CSV import with column matching",
  description:
    "A data import in four steps: choose a CSV, match its columns to your fields (found for you where names are alike), review which rows are ready and which have problems and why, then import with progress and a summary.",
  category: "blocks",
  blockCategory: "import",
  tags: ["import", "csv", "spreadsheet", "upload", "column mapping", "data migration", "validation", "bulk", "contacts", "wizard"],
  files: [{ path: "components/blocks/import-1/import-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "progress", "select", "skeleton", "state-view"],
  examples: [
    { name: "import-1-demo", title: "Choose a file", file: "import-1-demo.tsx" },
    { name: "import-1-match", title: "Match columns", file: "import-1-match.tsx" },
    { name: "import-1-review", title: "Review with problems", file: "import-1-review.tsx" },
    { name: "import-1-loading", title: "Loading", file: "import-1-loading.tsx" },
    { name: "import-1-error", title: "Could not load", file: "import-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "import-1-loading", trigger: "state=\"loading\"", note: "A skeleton card under the real heading, announced as loading." },
    { id: "error", title: "Could not load", example: "import-1-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry). A failed import keeps you on the last step with your rows and a Try again button." },
  ],
  ai: {
    summary:
      "A CSV importer. <Import1 fields={[{ key, label, required, aliases: ['e-mail'], validate: (value) => string | null }]} sampleCsv onImport={(rows, progress) => Promise} defaultStep />. Columns are matched by key, label and aliases; required fields must be matched; each row is checked for missing required values, validate() reasons and duplicate emails; only passing rows reach onImport, which can call progress(done). Reject onImport to show its message and keep the rows. Without onImport a run is simulated.",
    whenToUse: ["Importing contacts, products or users from a spreadsheet", "Migrating data from another tool"],
    whenNotToUse: ["Uploading files of any kind (use upload-1)", "Editing rows in place (use a data table)"],
    composesWith: ["upload-1", "app-shell-1", "data-table"],
    a11y: [
      { keys: "Steps", action: "An ordered list that marks the current step and each finished one in words; focus moves to the new step's heading" },
      { keys: "Matching", action: "Each field's menu is labelled with the field name and says (required); a sample of the matched values shows beside it" },
      { keys: "Review", action: "A real table with a caption; every row says Ready or lists its problems in words beside an icon, not only by color" },
    ],
    customization: ["fields decide what can be imported, how it is checked and what other column names match it", "A CSV reader handles quotes, commas and line breaks inside quotes", "Choosing a file works by drag, click or the sample button, and a wrong file type says how to export a CSV"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
