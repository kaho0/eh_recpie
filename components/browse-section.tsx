"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Recipe } from "@/lib/csv-parser";

interface BrowseSectionProps {
  recipes: Recipe[];
}

export default function BrowseSection({ recipes }: BrowseSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const categories = useMemo(
    () => [
      ...new Set(
        recipes.map((recipe) => recipe.primaryCategory).filter(Boolean)
      ),
    ],
    [recipes]
  );

  const filteredRecipes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return recipes
      .filter((recipe) => {
        const matchesCategory = selectedCategory
          ? recipe.primaryCategory === selectedCategory
          : true;
        const matchesTime = selectedTime
          ? (recipe.totalMinutes ?? Infinity) <= selectedTime
          : true;
        const matchesQuery = normalizedQuery
          ? recipe.title.toLowerCase().includes(normalizedQuery)
          : true;
        return matchesCategory && matchesTime && matchesQuery;
      })
      .slice(0, 9);
  }, [recipes, selectedCategory, selectedTime, query]);

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-foreground text-balance">
            Fresh, flavorful, and never boring recipes.
          </h2>
          <p className="text-muted-foreground mt-3 text-sm">
            Filter directly against the CSV data—no fake stories, just recipes.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center mb-10">
          <div className="flex flex-wrap gap-3 items-center">
            <label className="text-sm font-medium text-foreground">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="px-4 py-2 bg-background border border-border rounded text-foreground text-sm"
            >
              <option value="">All</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={selectedTime ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                setSelectedTime(value ? Number(value) : null);
              }}
              className="px-4 py-2 bg-background border border-border rounded text-foreground text-sm"
            >
              <option value="">Any time</option>
              <option value="30">≤ 30 mins</option>
              <option value="60">≤ 60 mins</option>
              <option value="120">≤ 2 hours</option>
            </select>

            <button
              onClick={() => {
                setSelectedCategory("");
                setSelectedTime(null);
                setQuery("");
              }}
              className="text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground transition"
            >
              Clear filters
            </button>
          </div>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name"
            className="w-full lg:w-72 px-4 py-2 bg-background border border-border rounded text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipe/${recipe.id}`}
              className="border border-border rounded-xl overflow-hidden hover:border-primary transition group"
            >
              <div className="relative h-44 w-full overflow-hidden bg-muted">
                <Image
                  src={recipe.image || "/placeholder.jpg"}
                  alt={recipe.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              <div className="p-5 space-y-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {recipe.primaryCategory}
                </p>
                <h3 className="text-lg font-serif text-foreground">
                  {recipe.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {recipe.description}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>⭐ {recipe.rating?.toFixed(1) ?? "—"}</span>
                  {recipe.totalMinutes && (
                    <span>{recipe.totalMinutes} mins</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center text-muted-foreground mt-10">
            No recipes match those filters yet.
          </div>
        )}
      </div>
    </section>
  );
}
