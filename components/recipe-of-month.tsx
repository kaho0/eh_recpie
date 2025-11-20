import Image from "next/image"
import Link from "next/link"
import type { Recipe } from "@/lib/csv-parser"

interface RecipeOfMonthProps {
  recipe: Recipe
}

export default function RecipeOfMonth({ recipe }: RecipeOfMonthProps) {
  if (!recipe) {
    return null
  }

  const timeCopy = recipe.totalTime || (recipe.totalMinutes ? `${recipe.totalMinutes} mins` : null)

  return (
    <section className="py-16 bg-secondary">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-4">
              Recipe of the Month
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4 text-balance">{recipe.title}</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Rated {recipe.rating?.toFixed(1) ?? "4.5"} stars by real cooks, this dish captures the best of our archive.
            </p>
            <p className="text-foreground mb-8 text-sm leading-relaxed">{recipe.description}</p>
            <div className="flex flex-wrap gap-4 text-xs uppercase tracking-wide text-muted-foreground mb-8">
              {timeCopy && <span className="bg-background/50 px-3 py-1 rounded-full">⏱ {timeCopy}</span>}
              {recipe.servings && <span className="bg-background/50 px-3 py-1 rounded-full">{recipe.servings}</span>}
            </div>
            <Link
              href={`/recipe/${recipe.id}`}
              className="inline-flex items-center justify-center px-6 py-2 bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition rounded-full"
            >
              Cook this recipe
            </Link>
          </div>

          <div className="relative h-96 rounded-lg overflow-hidden">
            <Image
              src={recipe.image || "/placeholder.jpg"}
              alt={recipe.title}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
