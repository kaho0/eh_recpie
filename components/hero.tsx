interface HeroProps {
  totalRecipes: number;
  topCategory?: string;
  averageRating?: number;
}

export default function Hero({
  totalRecipes,
  topCategory,
  averageRating,
}: HeroProps) {
  const stats = [
    {
      label: "Recipes tested",
      value: totalRecipes.toLocaleString(),
    },
    {
      label: "Reader favorite",
      value: topCategory ?? "Seasonal picks",
    },
    {
      label: "Average rating",
      value: averageRating ? `${averageRating.toFixed(1)} / 5` : "4.0+",
    },
  ];

  return (
    <section className="w-full bg-accent py-16">
      <div className="max-w-7xl mx-auto px-4 text-center space-y-8">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Real recipes, zero fluff
        </p>
        <h1 className="text-balance text-3xl md:text-5xl font-serif font-bold text-foreground">
          Cook smarter with {totalRecipes.toLocaleString()} tried-and-loved
          recipes.
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mx-auto max-w-2xl">
          Pulled straight from our recipe archive so you can skip the filler
          posts and get to the good stuff—fast weeknight mains, weekend baking
          projects, and everything between.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-background/60 border border-border rounded-lg py-4 px-6"
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                {stat.label}
              </p>
              <p className="text-xl font-semibold text-foreground">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
