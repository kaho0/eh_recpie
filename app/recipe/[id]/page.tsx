import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { assignWikimediaImages } from "@/lib/wikimedia"
import { getRecipeById } from "@/lib/csv-parser"

interface RecipePageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: RecipePageProps) {
  const { id } = await params
  const recipe = await getRecipeById(id)
  if (!recipe) {
    return {
      title: "Recipe not found",
    }
  }

  return {
    title: `${recipe.title} | Olive Recipes`,
    description: recipe.description,
  }
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params
  const recipe = await getRecipeById(id)
  if (!recipe) {
    notFound()
  }

  await assignWikimediaImages([recipe], { limit: 1 })

  const stats = [
    { label: "Prep", value: recipe.prepTime || formatMinutes(recipe.prepMinutes) },
    { label: "Cook", value: recipe.cookTime || formatMinutes(recipe.cookMinutes) },
    { label: "Total", value: recipe.totalTime || formatMinutes(recipe.totalMinutes) },
    { label: "Servings", value: recipe.servings || recipe.yield || "—" },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition">
          ← Back to recipes
        </Link>

        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{recipe.primaryCategory}</p>
          <h1 className="text-4xl font-serif font-bold text-balance">{recipe.title}</h1>
          <p className="text-muted-foreground text-lg">{recipe.description}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
            <Image src={recipe.image || "/placeholder.jpg"} alt={recipe.title} fill className="object-cover" sizes="(min-width: 768px) 60vw, 100vw" />
          </div>

          <aside className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-secondary rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-semibold">{stat.value ?? "—"}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Rating</p>
              <p className="text-2xl font-semibold">{recipe.rating ? `${recipe.rating.toFixed(1)} / 5` : "Not yet rated"}</p>
            </div>

            {recipe.url && recipe.url !== "#" && (
              <a href={recipe.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-full px-4 py-2 border border-border rounded-lg text-sm font-medium hover:border-primary transition">
                View original source
              </a>
            )}
          </aside>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <section>
            <h2 className="text-2xl font-serif font-semibold mb-4">Ingredients</h2>
            <ul className="space-y-3 text-sm">
              {recipe.ingredients.length > 0 ? (
                recipe.ingredients.map((ingredient, index) => (
                  <li key={`${ingredient}-${index}`} className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span>{ingredient}</span>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">Ingredient details coming soon.</li>
              )}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold mb-4">Directions</h2>
            <ol className="space-y-4 text-sm">
              {recipe.directions.length > 0 ? (
                recipe.directions.map((step, index) => (
                  <li key={`${index}-${step.slice(0, 10)}`} className="flex gap-4">
                    <span className="text-primary font-semibold">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">Directions not available in CSV.</li>
              )}
            </ol>
          </section>
        </div>

        {recipe.nutrition && (
          <section className="border border-border rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-2">Estimated nutrition</h2>
            <p className="text-sm text-muted-foreground">{recipe.nutrition}</p>
          </section>
        )}
      </div>
    </main>
  )
}

function formatMinutes(value: number | null | undefined): string | null {
  if (!value) return null
  if (value < 60) return `${value} mins`
  const hours = Math.floor(value / 60)
  const minutes = value % 60
  if (minutes === 0) return `${hours} hr${hours > 1 ? "s" : ""}`
  return `${hours} hr${hours > 1 ? "s" : ""} ${minutes} min`
}

