import { promises as fs } from "fs"
import path from "node:path"
import { cache } from "react"

export interface Recipe {
  id: string
  title: string
  description: string
  url: string
  rating: number | null
  primaryCategory: string
  cuisineTrail: string[]
  prepTime: string
  cookTime: string
  totalTime: string
  prepMinutes: number | null
  cookMinutes: number | null
  totalMinutes: number | null
  servings: string
  yield: string
  ingredients: string[]
  directions: string[]
  nutrition: string
  image: string
  author: string
  tags: string[]
  diet: string
  course: string
}

type RawRecipe = Record<string, string>

const HEADER_ALIASES: Record<string, string> = {
  recipe_title: "recipe_name",
  image: "img_src",
  picture: "img_src",
  description_text: "description",
}

const DATASET_PATH = path.join(process.cwd(), "recipes.csv")

export const getRecipes = cache(async (): Promise<Recipe[]> => {
  try {
    const csvText = await fs.readFile(DATASET_PATH, "utf-8")
    return parseCSV(csvText)
  } catch (error) {
    console.error("Error loading recipes.csv:", error)
    return []
  }
})

export function parseCSV(csvText: string): Recipe[] {
  const rows = tokenizeCSV(csvText)
  if (rows.length === 0) return []

  const headers = rows[0].map((header, index) => normalizeHeader(header, index))
  const recipes: Recipe[] = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row.some((value) => value && value.trim().length > 0)) continue

    const raw: RawRecipe = {}
    headers.forEach((header, index) => {
      const value = row[index] ?? ""
      if (header) {
        raw[header] = value.trim()
      }
    })

    const recipe = normalizeRecipe(raw, i)
    if (recipe) {
      recipes.push(recipe)
    }
  }

  return recipes
}

function tokenizeCSV(text: string): string[][] {
  const rows: string[][] = []
  let field = ""
  let row: string[] = []
  let insideQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        field += '"'
        i++
      } else {
        insideQuotes = !insideQuotes
      }
      continue
    }

    if (!insideQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && nextChar === "\n") {
        i++
      }
      row.push(field)
      rows.push(row)
      field = ""
      row = []
      continue
    }

    if (char === "," && !insideQuotes) {
      row.push(field)
      field = ""
      continue
    }

    field += char
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

function normalizeHeader(rawHeader: string, index: number): string {
  const cleaned = (rawHeader ?? "").replace(/^\uFEFF/, "").trim().toLowerCase()
  if (!cleaned) {
    return index === 0 ? "id" : ""
  }

  return HEADER_ALIASES[cleaned] ?? cleaned
}

function normalizeRecipe(raw: RawRecipe, fallbackIndex: number): Recipe | null {
  const title = raw.recipe_name || raw.recipe_title
  if (!title) return null

  const cuisineTrail = buildCuisineTrail(raw.cuisine_path, raw.cuisine, raw.category)
  const primaryCategory =
    raw.category ||
    raw.course ||
    cuisineTrail[0] ||
    "Everyday Favorites"

  const rating = parseRating(raw.rating)
  const ingredients = splitList(raw.ingredients)
  const directions = splitDirections(raw.directions || raw.instructions)
  const description = buildDescription(raw.description, directions)

  return {
    id: raw.id || String(fallbackIndex),
    title,
    description,
    url: raw.url || "#",
    rating,
    primaryCategory,
    cuisineTrail,
    prepTime: raw.prep_time || "",
    cookTime: raw.cook_time || "",
    totalTime: raw.total_time || raw.timing || "",
    prepMinutes: parseDuration(raw.prep_time),
    cookMinutes: parseDuration(raw.cook_time),
    totalMinutes: parseDuration(raw.total_time) ?? sumDurations(parseDuration(raw.prep_time), parseDuration(raw.cook_time)),
    servings: raw.servings || "",
    yield: raw.yield || "",
    ingredients,
    directions,
    nutrition: raw.nutrition || "",
    image: raw.img_src || "/placeholder.jpg",
    author: raw.author || "",
    tags: splitTags(raw.tags),
    diet: raw.diet || "",
    course: raw.course || "",
  }
}

function parseRating(value?: string): number | null {
  if (!value) return null
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

function parseDuration(value?: string): number | null {
  if (!value) return null
  const normalized = value.toLowerCase()
  const regex = /(\d+)\s*(hours?|hrs?|hr|h|minutes?|mins?|min|m)\b/g
  let match: RegExpExecArray | null
  let total = 0

  while ((match = regex.exec(normalized))) {
    const amount = Number.parseInt(match[1], 10)
    const unit = match[2]
    if (Number.isNaN(amount)) continue
    if (unit.startsWith("h") || unit.startsWith("hr")) {
      total += amount * 60
    } else {
      total += amount
    }
  }

  return total > 0 ? total : null
}

function sumDurations(...values: Array<number | null | undefined>): number | null {
  const total = values.reduce((acc, value) => (value ? acc + value : acc), 0)
  return total > 0 ? total : null
}

function splitList(value?: string): string[] {
  if (!value) return []
  return value
    .split(/[\n|,]/)
    .map((item) => item.replace(/["']/g, "").trim())
    .filter(Boolean)
}

function splitDirections(value?: string): string[] {
  if (!value) return []
  return value
    .split(/\r?\n+/)
    .map((line) => line.replace(/["']/g, "").trim())
    .filter(Boolean)
}

function splitTags(value?: string): string[] {
  if (!value) return []
  return value
    .split(/[|,]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function buildCuisineTrail(...values: Array<string | undefined>): string[] {
  for (const value of values) {
    if (value && value.includes("/")) {
      const parts = value.split("/").map((part) => part.trim()).filter(Boolean)
      if (parts.length > 0) {
        return parts
      }
    }
  }

  return values
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
}

function buildDescription(description?: string, directions: string[] = []): string {
  if (description) return description
  if (directions.length === 0) return ""
  return directions[0]
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const recipes = await getRecipes()
  const recipe = recipes.find((entry) => entry.id === id)
  return recipe ?? null
}
