/** Mirrors foods.md — sections and items only. */

export type CatalogSection = {
  id: string
  title: string
  items: string[]
}

export const defaultCatalog: CatalogSection[] = [
  {
    id: 'protein',
    title: 'Protein',
    items: [
      'Bacon',
      'Chicken Breasts',
      'Chicken Thighs',
      'Ground Turkey',
      'Italian Sausages',
      'Sausage Patties',
      'Salmon',
      'Thin Ribeye Steak',
      'Eggs',
    ],
  },
  {
    id: 'produce',
    title: 'Produce',
    items: [
      'Avocados',
      'Bananas',
      'Blueberries',
      'Broccoli',
      'Carrots',
      'Cucumbers',
      'Garlic',
      'Lemons',
      'Lettuce',
      'Mandarins',
      'Mushrooms',
      'Onions',
      'Peppers',
      'Potatoes',
      'Sweet Potatoes',
      'Raspberries',
      'Spinach',
      'Spring Mix',
      'Strawberries',
      'Tomatoes',
    ],
  },
  {
    id: 'dairy-refrigerated',
    title: 'Dairy & Refrigerated',
    items: [
      'Butter',
      'Cream Cheese',
      'Feta',
      'Sliced Cheese',
      'Cheese',
      'Half & Half',
      'Milk',
      'Sour Cream',
      'Yogurt',
    ],
  },
  {
    id: 'grains-bakery',
    title: 'Grains & Bakery',
    items: ['Baguette', 'English Muffins', 'Rice', 'Tortillas', 'Tortellini'],
  },
  {
    id: 'pantry',
    title: 'Pantry',
    items: [
      'Black Beans',
      'Broth/Stock',
      'Chips',
      'Cinnamon',
      'Cooking Sauce',
      'Croutons',
      'Diced Tomatoes',
      'Frozen Vegetables',
      'Granola',
      'Pasta',
      'Peanut Butter',
      'Pickle Chips',
      'Soy Sauce',
      'Taco Seasoning',
      'Tortilla Chips',
    ],
  },
  {
    id: 'drinks',
    title: 'Drinks',
    items: ['Lemonade', 'Sparkling Water'],
  },
]

// --- Layout (single source: `defaultCatalog` order + titles) ---

export const UNCATEGORIZED_ID = 'uncategorized'

function normLabel(label: string): string {
  return label.trim().toLowerCase()
}

/** First matching section wins if a label ever appeared twice in the catalog. */
const defaultLabelToSectionId: Map<string, string> = (() => {
  const m = new Map<string, string>()
  for (const section of defaultCatalog) {
    for (const item of section.items) {
      const key = normLabel(item)
      if (!m.has(key)) m.set(key, section.id)
    }
  }
  return m
})()

/** Resolves a catalog item label to its section id using the default catalog, or `uncategorized`. Used for migration only. */
export function resolveSectionIdForLabel(label: string): string {
  return defaultLabelToSectionId.get(normLabel(label)) ?? UNCATEGORIZED_ID
}

export type ListItemWithSection = {
  id: string
  label: string
  sectionId: string
}

export type HomeSection = {
  sectionId: string
  title: string
  items: ListItemWithSection[]
}

/**
 * Groups shopping rows by catalog section. Order follows `catalog`; only non-empty
 * sections appear. Uncategorized rows render last under "Other".
 */
export function layoutShoppingListForHome(
  items: ListItemWithSection[],
  catalog: CatalogSection[],
): HomeSection[] {
  const bySection = new Map<string, ListItemWithSection[]>()
  for (const row of items) {
    const sid = row.sectionId
    const list = bySection.get(sid)
    if (list) list.push(row)
    else bySection.set(sid, [row])
  }

  const out: HomeSection[] = []

  for (const section of catalog) {
    const rows = bySection.get(section.id)
    if (rows?.length)
      out.push({ sectionId: section.id, title: section.title, items: rows })
  }

  const other = bySection.get(UNCATEGORIZED_ID)
  if (other?.length)
    out.push({
      sectionId: UNCATEGORIZED_ID,
      title: 'Other',
      items: other,
    })

  return out
}
