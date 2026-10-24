import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "listing-1",
  type: "registry:block",
  title: "Listing 1: property listing",
  description:
    "A property page: a photo gallery with buttons, thumbnails and arrow keys, price and the facts that matter, description and features, and a viewing request form with times to choose from, field errors and a clear result.",
  category: "blocks",
  blockCategory: "listing",
  tags: ["real estate", "property", "listing", "estate agent", "gallery", "viewing", "rent", "homes"],
  files: [{ path: "components/blocks/listing-1/listing-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "cover-art", "media", "skeleton", "state-view"],
  examples: [
    { name: "listing-1-demo", title: "Default", file: "listing-1-demo.tsx" },
    { name: "listing-1-rent", title: "To rent", file: "listing-1-rent.tsx" },
    { name: "listing-1-loading", title: "Loading", file: "listing-1-loading.tsx" },
    { name: "listing-1-empty", title: "Listing unavailable", file: "listing-1-empty.tsx" },
    { name: "listing-1-error", title: "Could not load", file: "listing-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "listing-1-loading", trigger: "state=\"loading\"", note: "Skeleton for the gallery, facts and form under the page, announced as loading." },
    { id: "empty", title: "Listing unavailable", example: "listing-1-empty", trigger: "state=\"empty\"", note: "Says the listing is no longer available and points back to search; pass listing={null}." },
    { id: "error", title: "Could not load", example: "listing-1-error", trigger: "state=\"error\"", note: "An alert saying to check the connection, with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "A property listing page. <Listing1 listing={{ address, city, price, offer: 'For sale' | 'To rent', per?, type, beds, baths, area, description, features: string[], photos: [{ media?, alt }], agent: { name, role, phone? }, viewings: [{ id, label }] }} currency='USD' onRequestViewing={({ viewingId, name, email }) => Promise} />. Photos use Media with generated artwork until you pass media. listing={null} shows the no-longer-available state.",
    whenToUse: ["An estate agent's or landlord's property page", "Any single-item page with a gallery, key facts and a booking request"],
    whenNotToUse: ["A search results grid; use directory-1", "A product page in a shop; use the ecommerce blocks"],
    composesWith: ["directory-1", "locations-1", "gallery-1", "header-1"],
    a11y: [
      { keys: "Gallery", action: "A group with a role description of gallery; Previous and Next buttons, a thumbnail button per photo naming its content, and the arrow keys; the position ('2 of 4') is a polite announcement" },
      { keys: "Photos", action: "Each has its own alt text; thumbnails are decorative" },
      { keys: "Form", action: "Labelled fields, a fieldset for the times, aria-invalid with a message under each missing field; the result is a polite announcement and an error is an alert" },
      { keys: "Facts", action: "A definition list with icons that are decoration" },
    ],
    customization: ["currency", "photos with media and alt", "viewings you offer", "onRequestViewing; reject and what was typed stays"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
