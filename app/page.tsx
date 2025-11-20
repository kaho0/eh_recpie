import Header from "@/components/header";
import Hero from "@/components/hero";
import FeaturedRecipes from "@/components/featured-recipes";
import RecipeOfMonth from "@/components/recipe-of-month";
import BrowseSection from "@/components/browse-section";
import About from "@/components/about";
import CategoryCarouselComponent, {
  type CategoryHighlight,
} from "@/components/category-carousel";
import { getRecipes, type Recipe } from "@/lib/csv-parser";
import {
  assignWikimediaImages,
  getCuratedImage,
  getPlaceholderImage,
  getWikimediaImage,
  isHighResolutionImage,
} from "@/lib/wikimedia";

function getFeaturedRecipes(recipes: Recipe[]): Recipe[] {
  return [...recipes]
    .filter((recipe) => typeof recipe.rating === "number")
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 4);
}

function getRecipeOfMonth(recipes: Recipe[]): Recipe | null {
  if (recipes.length === 0) return null;
  const sorted = [...recipes].sort((a, b) => {
    const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
    if (ratingDiff !== 0) return ratingDiff;
    return (
      (a.totalMinutes ?? Number.MAX_SAFE_INTEGER) -
      (b.totalMinutes ?? Number.MAX_SAFE_INTEGER)
    );
  });
  return sorted[0] ?? null;
}

async function buildCategoryHighlights(
  recipes: Recipe[]
): Promise<CategoryHighlight[]> {
  const map = new Map<string, { count: number; image: string }>();

  recipes.forEach((recipe) => {
    const key = recipe.primaryCategory || "Recipes";
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      if (
        existing.image.includes("placeholder") &&
        !recipe.image.includes("placeholder")
      ) {
        existing.image = recipe.image;
      }
    } else {
      map.set(key, { count: 1, image: recipe.image });
    }
  });

  const highlights = [...map.entries()]
    .map(([name, value]) => ({
      name,
      count: value.count,
      image: value.image,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  await Promise.all(
    highlights.map(async (highlight) => {
      if (
        !highlight.image ||
        highlight.image?.includes("placeholder") ||
        highlight.image?.startsWith("/")
      ) {
        const wikimediaImage = await getWikimediaImage(
          `${highlight.name} food dish`
        );
        if (isHighResolutionImage(wikimediaImage)) {
          highlight.image = wikimediaImage.url;
        } else {
          highlight.image =
            getCuratedImage(highlight.name) ?? getPlaceholderImage();
        }
      }
    })
  );

  return highlights;
}

function getAverageRating(recipes: Recipe[]): number | null {
  const ratings = recipes
    .map((recipe) => recipe.rating)
    .filter((value): value is number => typeof value === "number");
  if (ratings.length === 0) return null;
  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return Number((total / ratings.length).toFixed(1));
}

export default async function Home() {
  const recipes = await getRecipes();
  const featuredRecipes = getFeaturedRecipes(recipes);
  const recipeOfMonth = getRecipeOfMonth(recipes);
  const averageRating = getAverageRating(recipes);
  const browseRecipes = recipes.slice(0, 60);
  const recipesNeedingImages = new Map<string, Recipe>();

  featuredRecipes.forEach((recipe) =>
    recipesNeedingImages.set(recipe.id, recipe)
  );
  browseRecipes.forEach((recipe) =>
    recipesNeedingImages.set(recipe.id, recipe)
  );
  if (recipeOfMonth) {
    recipesNeedingImages.set(recipeOfMonth.id, recipeOfMonth);
  }

  await assignWikimediaImages([...recipesNeedingImages.values()], {
    limit: recipesNeedingImages.size,
  });
  const categoryHighlights = await buildCategoryHighlights(recipes);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero
        totalRecipes={recipes.length}
        topCategory={categoryHighlights[0]?.name}
        averageRating={averageRating ?? undefined}
      />
      <FeaturedRecipes
        recipes={
          featuredRecipes.length > 0 ? featuredRecipes : recipes.slice(0, 4)
        }
      />
      {recipeOfMonth && <RecipeOfMonth recipe={recipeOfMonth} />}
      <BrowseSection recipes={browseRecipes} />
      {categoryHighlights.length > 0 && (
        <CategoryCarouselComponent categories={categoryHighlights} />
      )}
      <About />
    </main>
  );
}
