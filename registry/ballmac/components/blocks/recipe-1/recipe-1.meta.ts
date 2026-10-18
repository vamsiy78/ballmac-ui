import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "recipe-1",
  type: "registry:block",
  title: "Recipe 1: scale, check off and time",
  description:
    "A recipe you can cook from: change how many it serves and every amount scales the way a cook reads it, switch metric and US units, tick off ingredients and steps, and start a timer on the steps that need waiting.",
  category: "blocks",
  blockCategory: "recipe",
  tags: ["recipe", "cooking", "ingredients", "servings", "timer", "food", "kitchen", "method", "meal", "baking"],
  files: [{ path: "components/blocks/recipe-1/recipe-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "cover-art", "segmented-control"],
  examples: [
    { name: "recipe-1-demo", title: "Spaghetti carbonara", file: "recipe-1-demo.tsx" },
    { name: "recipe-1-baking", title: "Baking, in cups and spoons", file: "recipe-1-baking.tsx" },
  ],
  statesNone: "Static content with its own tools: nothing to load, submit or fail.",
  ai: {
    summary:
      "A recipe. <Recipe1 title intro serves={4} prep={10} cook={20} difficulty calories ingredients={[{ id, qty, unit: 'g' | 'ml' | 'tbsp' | 'tsp' | 'cup' | undefined, name, note }]} steps={[{ id, text, minutes }]} />. qty is for the recipe's own serves; changing the servings scales every amount. Spoons and cups read as ½ ¼ ⅓ fractions, g and ml as whole numbers (rounded to 5 above 100); US units turn g into oz and ml into fl oz. A step with minutes gets a start, pause and reset timer that says 'Time is up'.",
    whenToUse: ["Food blogs, meal-kit sites and cooking apps", "Any how-to with amounts that scale and steps that need waiting"],
    whenNotToUse: ["A shopping list across recipes", "A meal planner calendar"],
    composesWith: ["gallery-1", "reviews-1", "comments-1", "header-1"],
    a11y: [
      { keys: "Tab, Space", action: "Servings are Fewer and More buttons with the count read as '4 people'; every ingredient and step has a real checkbox, and the counts (3 of 7 gathered) are announced politely" },
      { keys: "Timer", action: "Each timer is a role=timer that reads '8 minutes 0 seconds left', its button says Start, Pause or Resume, and 'Time is up' is announced" },
      { keys: "Steps", action: "Each step reads 'Step 2.' first, and the current one is outlined as well as numbered" },
    ],
    customization: ["serves is the base the amounts are written for", "Countable ingredients (eggs) round to a sensible fraction or one decimal", "The timer ring and the hero mirror in right-to-left"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
