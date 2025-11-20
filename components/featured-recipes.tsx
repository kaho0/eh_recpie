import Image from "next/image"
import Link from "next/link"
import type { Recipe } from "@/lib/csv-parser"

interface FeaturedRecipesProps {
  recipes: Recipe[]
}

export default function FeaturedRecipes({ recipes }: FeaturedRecipesProps) {
  if (!recipes || recipes.length === 0) {
    return (
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-muted-foreground">Loading recipes...</div>
        </div>
      </section>
    )
  }

  const renderTime = (recipe: Recipe) => {
    if (recipe.totalTime) return recipe.totalTime
    if (recipe.totalMinutes) return `${recipe.totalMinutes} mins`
    return "Flexible timing"
  }

  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif font-semibold text-foreground">Trending now</h2>
          <p className="text-sm text-muted-foreground">Pulled directly from the CSV archive</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recipes.map((recipe) => (
            <Link key={recipe.id} href={`/recipe/${recipe.id}`} className="group flex flex-col rounded-2xl overflow-hidden border border-border hover:border-primary transition">
              <div className="relative h-64 w-full overflow-hidden bg-muted">
                <Image
                  src={recipe.image || "/placeholder.jpg"}
                  alt={recipe.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
                <div className="absolute top-4 left-4 bg-background/80 text-xs font-semibold px-3 py-1 rounded-full">
                  {recipe.primaryCategory}
                </div>
              </div>
              <div className="flex flex-col gap-2 p-5">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Rating {recipe.rating ?? "—"}</p>
                <h3 className="text-base font-serif text-foreground group-hover:text-primary transition">{recipe.title}</h3>
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto">
                  <span>{renderTime(recipe)}</span>
                  {recipe.servings && <span>{recipe.servings} servings</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
