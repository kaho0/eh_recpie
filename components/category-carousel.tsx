"use client";

import Image from "next/image";

export interface CategoryHighlight {
  name: string;
  image: string;
  count: number;
}

interface CategoryCarouselProps {
  categories: CategoryHighlight[];
}

export default function CategoryCarousel({
  categories,
}: CategoryCarouselProps) {
  return (
    <section className="py-16 bg-muted/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Browse by craving
            </p>
            <h2 className="text-3xl font-serif font-bold text-foreground">
              Categories we’re cooking through
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {categories.length} categories pulled from the CSV so you can jump
            straight to what you need.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.name}
              className="group relative overflow-hidden rounded-2xl border border-border bg-background shadow-sm hover:shadow-md transition"
            >
              <div className="relative h-32 w-full overflow-hidden">
                <Image
                  src={category.image || "/placeholder.jpg"}
                  alt={category.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                <p className="absolute bottom-3 left-4 text-xs uppercase tracking-wide text-white/90">
                  {category.count} recipes
                </p>
              </div>
              <div className="p-5 space-y-2">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Category
                </p>
                <h3 className="text-xl font-serif text-foreground">
                  {category.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
