import type { Recipe } from "@/lib/csv-parser";

const API_ENDPOINT =
  "https://api.wikimedia.org/core/v1/wikipedia/en/search/page";
const DEFAULT_PLACEHOLDER =
  "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";
const USER_AGENT = "recipe-website-demo/1.0 (contact@recipe-app.local)";
const MIN_IMAGE_WIDTH = 400;

type WikimediaThumbnail = {
  url: string;
  width?: number;
  height?: number;
};

type WikimediaPage = {
  title: string;
  thumbnail?: WikimediaThumbnail;
  originalimage?: { source: string; width?: number; height?: number };
  content_urls?: {
    desktop?: { page?: string };
  };
};

type WikimediaResponse = {
  pages?: WikimediaPage[];
};

export type WikimediaImageInfo = {
  url: string;
  width?: number;
  height?: number;
};

const CATEGORY_IMAGE_FALLBACKS: Record<string, string> = {
  Desserts:
    "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1200&q=60",
  "Drinks Recipes":
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=60",
  Dinner:
    "https://images.unsplash.com/photo-1555992336-cbfdbc9c7b11?auto=format&fit=crop&w=1200&q=60",
  Lunch:
    "https://images.unsplash.com/photo-1528712306091-ed0763094c98?auto=format&fit=crop&w=1200&q=60",
  Breakfast:
    "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=60",
  "Side Dish":
    "https://images.unsplash.com/photo-1505253668822-42074d58a7fa?auto=format&fit=crop&w=1200&q=60",
  "Salad Recipes":
    "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=60",
  Seafood:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=60",
};

const imageCache = new Map<string, WikimediaImageInfo | null>();

export async function getWikimediaImage(
  query: string
): Promise<WikimediaImageInfo | null> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;
  if (imageCache.has(normalized)) {
    return imageCache.get(normalized) ?? null;
  }

  try {
    const url = `${API_ENDPOINT}?q=${encodeURIComponent(query)}&limit=1`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Api-User-Agent": USER_AGENT,
      },
      next: { revalidate: 60 * 60 * 12 },
    });

    if (!response.ok) {
      imageCache.set(normalized, null);
      return null;
    }

    const data = (await response.json()) as WikimediaResponse;
    const page = data.pages?.[0];
    const image = selectImageFromPage(page);

    imageCache.set(normalized, image ?? null);
    return image ?? null;
  } catch (error) {
    console.error("Error fetching Wikimedia image:", error);
    imageCache.set(normalized, null);
    return null;
  }
}

function selectImageFromPage(page?: WikimediaPage): WikimediaImageInfo | null {
  if (!page) return null;
  const candidates: WikimediaImageInfo[] = [];

  if (page.originalimage?.source) {
    candidates.push({
      url: page.originalimage.source,
      width: page.originalimage.width,
      height: page.originalimage.height,
    });
  }

  if (page.thumbnail?.url) {
    candidates.push({
      url: page.thumbnail.url,
      width: page.thumbnail.width,
      height: page.thumbnail.height,
    });
  }

  const fallbackUrl = buildFallbackFromContentUrl(
    page.content_urls?.desktop?.page
  );
  if (fallbackUrl) {
    candidates.push({ url: fallbackUrl });
  }

  if (candidates.length === 0) return null;

  const highResCandidate = candidates.find((candidate) =>
    isHighResolutionImage(candidate)
  );
  return highResCandidate ?? candidates[0];
}

export function isHighResolutionImage(
  image?: WikimediaImageInfo | null
): image is WikimediaImageInfo {
  if (!image) return false;
  const width = image.width ?? MIN_IMAGE_WIDTH;
  return width >= MIN_IMAGE_WIDTH;
}

function buildFallbackFromContentUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const title = url.split("/").pop();
    if (!title) return null;
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${title}.jpg`;
  } catch {
    return null;
  }
}

interface AssignOptions {
  limit?: number;
  fallback?: string;
  queryFormatter?: (recipe: Recipe) => string;
}

export async function assignWikimediaImages(
  recipes: Recipe[],
  options?: AssignOptions
): Promise<void> {
  if (!recipes || recipes.length === 0) return;

  const {
    limit = recipes.length,
    fallback = DEFAULT_PLACEHOLDER,
    queryFormatter,
  } = options ?? {};
  const uniqueRecipes = getUniqueRecipes(recipes).slice(0, limit);

  const concurrency = 6;
  for (let i = 0; i < uniqueRecipes.length; i += concurrency) {
    const chunk = uniqueRecipes.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (recipe) => {
        const query = queryFormatter
          ? queryFormatter(recipe)
          : `${recipe.title} food`;
        const wikimediaImage = await getWikimediaImage(query);
        if (isHighResolutionImage(wikimediaImage)) {
          recipe.image = wikimediaImage.url;
          return;
        }

        if (!recipe.image || recipe.image.includes("placeholder")) {
          const curated = getCuratedImage(recipe.primaryCategory);
          recipe.image = curated ?? fallback;
        }
      })
    );
  }
}

function getUniqueRecipes(recipes: Recipe[]): Recipe[] {
  const map = new Map<string, Recipe>();
  recipes.forEach((recipe) => {
    map.set(recipe.id, recipe);
  });
  return [...map.values()];
}

export function getPlaceholderImage(): string {
  return DEFAULT_PLACEHOLDER;
}

export function getCuratedImage(category?: string): string | null {
  if (!category) return null;
  return CATEGORY_IMAGE_FALLBACKS[category] ?? null;
}
