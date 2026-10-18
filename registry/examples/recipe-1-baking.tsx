"use client"

import { Recipe1 } from "@/components/ballmac/blocks/recipe-1/recipe-1"

export default function Recipe1Baking() {
  return (
    <Recipe1
      title="Oat and raisin cookies"
      intro="Chewy in the middle, crisp at the edge, and ready from a single bowl."
      serves={12}
      prep={15}
      cook={12}
      difficulty="Easy"
      calories={190}
      ingredients={[
        { id: "a", qty: 1.5, unit: "cup", name: "rolled oats" },
        { id: "b", qty: 0.75, unit: "cup", name: "plain flour" },
        { id: "c", qty: 0.5, unit: "tsp", name: "baking soda" },
        { id: "d", qty: 0.333, unit: "cup", name: "brown sugar", note: "packed" },
        { id: "e", qty: 115, unit: "g", name: "butter", note: "softened" },
        { id: "f", qty: 1, name: "egg" },
        { id: "g", qty: 0.75, unit: "cup", name: "raisins" },
      ]}
      steps={[
        { id: "1", text: "Heat the oven to 180°C. Beat the butter and sugar until pale, then the egg." },
        { id: "2", text: "Stir in the flour, soda and oats, then the raisins. Spoon onto a lined tray with room to spread." },
        { id: "3", text: "Bake until golden at the edges but still soft in the middle. They firm up as they cool.", minutes: 12 },
      ]}
    />
  )
}
