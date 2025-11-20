module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/lib/wikimedia.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assignWikimediaImages",
    ()=>assignWikimediaImages,
    "getCuratedImage",
    ()=>getCuratedImage,
    "getPlaceholderImage",
    ()=>getPlaceholderImage,
    "getWikimediaImage",
    ()=>getWikimediaImage,
    "isHighResolutionImage",
    ()=>isHighResolutionImage
]);
const API_ENDPOINT = "https://api.wikimedia.org/core/v1/wikipedia/en/search/page";
const DEFAULT_PLACEHOLDER = "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";
const USER_AGENT = "recipe-website-demo/1.0 (contact@recipe-app.local)";
const MIN_IMAGE_WIDTH = 400;
const CATEGORY_IMAGE_FALLBACKS = {
    Desserts: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1200&q=60",
    "Drinks Recipes": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=60",
    Dinner: "https://images.unsplash.com/photo-1555992336-cbfdbc9c7b11?auto=format&fit=crop&w=1200&q=60",
    Lunch: "https://images.unsplash.com/photo-1528712306091-ed0763094c98?auto=format&fit=crop&w=1200&q=60",
    Breakfast: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=60",
    "Side Dish": "https://images.unsplash.com/photo-1505253668822-42074d58a7fa?auto=format&fit=crop&w=1200&q=60",
    "Salad Recipes": "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=60",
    Seafood: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=60"
};
const imageCache = new Map();
async function getWikimediaImage(query) {
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
                "Api-User-Agent": USER_AGENT
            },
            next: {
                revalidate: 60 * 60 * 12
            }
        });
        if (!response.ok) {
            imageCache.set(normalized, null);
            return null;
        }
        const data = await response.json();
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
function selectImageFromPage(page) {
    if (!page) return null;
    const candidates = [];
    if (page.originalimage?.source) {
        candidates.push({
            url: page.originalimage.source,
            width: page.originalimage.width,
            height: page.originalimage.height
        });
    }
    if (page.thumbnail?.url) {
        candidates.push({
            url: page.thumbnail.url,
            width: page.thumbnail.width,
            height: page.thumbnail.height
        });
    }
    const fallbackUrl = buildFallbackFromContentUrl(page.content_urls?.desktop?.page);
    if (fallbackUrl) {
        candidates.push({
            url: fallbackUrl
        });
    }
    if (candidates.length === 0) return null;
    const highResCandidate = candidates.find((candidate)=>isHighResolutionImage(candidate));
    return highResCandidate ?? candidates[0];
}
function isHighResolutionImage(image) {
    if (!image) return false;
    const width = image.width ?? MIN_IMAGE_WIDTH;
    return width >= MIN_IMAGE_WIDTH;
}
function buildFallbackFromContentUrl(url) {
    if (!url) return null;
    try {
        const title = url.split("/").pop();
        if (!title) return null;
        return `https://commons.wikimedia.org/wiki/Special:FilePath/${title}.jpg`;
    } catch  {
        return null;
    }
}
async function assignWikimediaImages(recipes, options) {
    if (!recipes || recipes.length === 0) return;
    const { limit = recipes.length, fallback = DEFAULT_PLACEHOLDER, queryFormatter } = options ?? {};
    const uniqueRecipes = getUniqueRecipes(recipes).slice(0, limit);
    const concurrency = 6;
    for(let i = 0; i < uniqueRecipes.length; i += concurrency){
        const chunk = uniqueRecipes.slice(i, i + concurrency);
        await Promise.all(chunk.map(async (recipe)=>{
            const query = queryFormatter ? queryFormatter(recipe) : `${recipe.title} food`;
            const wikimediaImage = await getWikimediaImage(query);
            if (isHighResolutionImage(wikimediaImage)) {
                recipe.image = wikimediaImage.url;
                return;
            }
            if (!recipe.image || recipe.image.includes("placeholder")) {
                const curated = getCuratedImage(recipe.primaryCategory);
                recipe.image = curated ?? fallback;
            }
        }));
    }
}
function getUniqueRecipes(recipes) {
    const map = new Map();
    recipes.forEach((recipe)=>{
        map.set(recipe.id, recipe);
    });
    return [
        ...map.values()
    ];
}
function getPlaceholderImage() {
    return DEFAULT_PLACEHOLDER;
}
function getCuratedImage(category) {
    if (!category) return null;
    return CATEGORY_IMAGE_FALLBACKS[category] ?? null;
}
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[project]/lib/csv-parser.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getRecipeById",
    ()=>getRecipeById,
    "getRecipes",
    ()=>getRecipes,
    "parseCSV",
    ()=>parseCSV
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-rsc] (ecmascript)");
;
;
;
const HEADER_ALIASES = {
    recipe_title: "recipe_name",
    image: "img_src",
    picture: "img_src",
    description_text: "description"
};
const DATASET_PATH = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.cwd(), "recipes.csv");
const getRecipes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cache"])(async ()=>{
    try {
        const csvText = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["promises"].readFile(DATASET_PATH, "utf-8");
        return parseCSV(csvText);
    } catch (error) {
        console.error("Error loading recipes.csv:", error);
        return [];
    }
});
function parseCSV(csvText) {
    const rows = tokenizeCSV(csvText);
    if (rows.length === 0) return [];
    const headers = rows[0].map((header, index)=>normalizeHeader(header, index));
    const recipes = [];
    for(let i = 1; i < rows.length; i++){
        const row = rows[i];
        if (!row.some((value)=>value && value.trim().length > 0)) continue;
        const raw = {};
        headers.forEach((header, index)=>{
            const value = row[index] ?? "";
            if (header) {
                raw[header] = value.trim();
            }
        });
        const recipe = normalizeRecipe(raw, i);
        if (recipe) {
            recipes.push(recipe);
        }
    }
    return recipes;
}
function tokenizeCSV(text) {
    const rows = [];
    let field = "";
    let row = [];
    let insideQuotes = false;
    for(let i = 0; i < text.length; i++){
        const char = text[i];
        const nextChar = text[i + 1];
        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                field += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
            continue;
        }
        if (!insideQuotes && (char === "\n" || char === "\r")) {
            if (char === "\r" && nextChar === "\n") {
                i++;
            }
            row.push(field);
            rows.push(row);
            field = "";
            row = [];
            continue;
        }
        if (char === "," && !insideQuotes) {
            row.push(field);
            field = "";
            continue;
        }
        field += char;
    }
    if (field.length > 0 || row.length > 0) {
        row.push(field);
        rows.push(row);
    }
    return rows;
}
function normalizeHeader(rawHeader, index) {
    const cleaned = (rawHeader ?? "").replace(/^\uFEFF/, "").trim().toLowerCase();
    if (!cleaned) {
        return index === 0 ? "id" : "";
    }
    return HEADER_ALIASES[cleaned] ?? cleaned;
}
function normalizeRecipe(raw, fallbackIndex) {
    const title = raw.recipe_name || raw.recipe_title;
    if (!title) return null;
    const cuisineTrail = buildCuisineTrail(raw.cuisine_path, raw.cuisine, raw.category);
    const primaryCategory = raw.category || raw.course || cuisineTrail[0] || "Everyday Favorites";
    const rating = parseRating(raw.rating);
    const ingredients = splitList(raw.ingredients);
    const directions = splitDirections(raw.directions || raw.instructions);
    const description = buildDescription(raw.description, directions);
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
        course: raw.course || ""
    };
}
function parseRating(value) {
    if (!value) return null;
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
}
function parseDuration(value) {
    if (!value) return null;
    const normalized = value.toLowerCase();
    const regex = /(\d+)\s*(hours?|hrs?|hr|h|minutes?|mins?|min|m)\b/g;
    let match;
    let total = 0;
    while(match = regex.exec(normalized)){
        const amount = Number.parseInt(match[1], 10);
        const unit = match[2];
        if (Number.isNaN(amount)) continue;
        if (unit.startsWith("h") || unit.startsWith("hr")) {
            total += amount * 60;
        } else {
            total += amount;
        }
    }
    return total > 0 ? total : null;
}
function sumDurations(...values) {
    const total = values.reduce((acc, value)=>value ? acc + value : acc, 0);
    return total > 0 ? total : null;
}
function splitList(value) {
    if (!value) return [];
    return value.split(/[\n|,]/).map((item)=>item.replace(/["']/g, "").trim()).filter(Boolean);
}
function splitDirections(value) {
    if (!value) return [];
    return value.split(/\r?\n+/).map((line)=>line.replace(/["']/g, "").trim()).filter(Boolean);
}
function splitTags(value) {
    if (!value) return [];
    return value.split(/[|,]/).map((tag)=>tag.trim()).filter(Boolean);
}
function buildCuisineTrail(...values) {
    for (const value of values){
        if (value && value.includes("/")) {
            const parts = value.split("/").map((part)=>part.trim()).filter(Boolean);
            if (parts.length > 0) {
                return parts;
            }
        }
    }
    return values.map((value)=>value?.trim()).filter((value)=>Boolean(value));
}
function buildDescription(description, directions = []) {
    if (description) return description;
    if (directions.length === 0) return "";
    return directions[0];
}
async function getRecipeById(id) {
    const recipes = await getRecipes();
    const recipe = recipes.find((entry)=>entry.id === id);
    return recipe ?? null;
}
}),
"[project]/app/recipe/[id]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RecipePage,
    "generateMetadata",
    ()=>generateMetadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$wikimedia$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/wikimedia.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$csv$2d$parser$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/csv-parser.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
async function generateMetadata({ params }) {
    const { id } = await params;
    const recipe = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$csv$2d$parser$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getRecipeById"])(id);
    if (!recipe) {
        return {
            title: "Recipe not found"
        };
    }
    return {
        title: `${recipe.title} | Olive Recipes`,
        description: recipe.description
    };
}
async function RecipePage({ params }) {
    const { id } = await params;
    const recipe = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$csv$2d$parser$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getRecipeById"])(id);
    if (!recipe) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    }
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$wikimedia$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assignWikimediaImages"])([
        recipe
    ], {
        limit: 1
    });
    const stats = [
        {
            label: "Prep",
            value: recipe.prepTime || formatMinutes(recipe.prepMinutes)
        },
        {
            label: "Cook",
            value: recipe.cookTime || formatMinutes(recipe.cookMinutes)
        },
        {
            label: "Total",
            value: recipe.totalTime || formatMinutes(recipe.totalMinutes)
        },
        {
            label: "Servings",
            value: recipe.servings || recipe.yield || "—"
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen bg-background text-foreground",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-5xl mx-auto px-4 py-12 space-y-10",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                    href: "/",
                    className: "text-sm text-muted-foreground hover:text-primary transition",
                    children: "← Back to recipes"
                }, void 0, false, {
                    fileName: "[project]/app/recipe/[id]/page.tsx",
                    lineNumber: 47,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    className: "space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs uppercase tracking-[0.3em] text-muted-foreground",
                            children: recipe.primaryCategory
                        }, void 0, false, {
                            fileName: "[project]/app/recipe/[id]/page.tsx",
                            lineNumber: 52,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-4xl font-serif font-bold text-balance",
                            children: recipe.title
                        }, void 0, false, {
                            fileName: "[project]/app/recipe/[id]/page.tsx",
                            lineNumber: 53,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-muted-foreground text-lg",
                            children: recipe.description
                        }, void 0, false, {
                            fileName: "[project]/app/recipe/[id]/page.tsx",
                            lineNumber: 54,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/recipe/[id]/page.tsx",
                    lineNumber: 51,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                src: recipe.image || "/placeholder.jpg",
                                alt: recipe.title,
                                fill: true,
                                className: "object-cover",
                                sizes: "(min-width: 768px) 60vw, 100vw"
                            }, void 0, false, {
                                fileName: "[project]/app/recipe/[id]/page.tsx",
                                lineNumber: 59,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/recipe/[id]/page.tsx",
                            lineNumber: 58,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                            className: "space-y-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 gap-4 text-sm",
                                    children: stats.map((stat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-secondary rounded-lg p-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs uppercase tracking-wide text-muted-foreground",
                                                    children: stat.label
                                                }, void 0, false, {
                                                    fileName: "[project]/app/recipe/[id]/page.tsx",
                                                    lineNumber: 66,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-lg font-semibold",
                                                    children: stat.value ?? "—"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/recipe/[id]/page.tsx",
                                                    lineNumber: 67,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, stat.label, true, {
                                            fileName: "[project]/app/recipe/[id]/page.tsx",
                                            lineNumber: 65,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/app/recipe/[id]/page.tsx",
                                    lineNumber: 63,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-muted-foreground",
                                            children: "Rating"
                                        }, void 0, false, {
                                            fileName: "[project]/app/recipe/[id]/page.tsx",
                                            lineNumber: 73,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-2xl font-semibold",
                                            children: recipe.rating ? `${recipe.rating.toFixed(1)} / 5` : "Not yet rated"
                                        }, void 0, false, {
                                            fileName: "[project]/app/recipe/[id]/page.tsx",
                                            lineNumber: 74,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/recipe/[id]/page.tsx",
                                    lineNumber: 72,
                                    columnNumber: 13
                                }, this),
                                recipe.url && recipe.url !== "#" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: recipe.url,
                                    target: "_blank",
                                    rel: "noreferrer",
                                    className: "inline-flex items-center justify-center w-full px-4 py-2 border border-border rounded-lg text-sm font-medium hover:border-primary transition",
                                    children: "View original source"
                                }, void 0, false, {
                                    fileName: "[project]/app/recipe/[id]/page.tsx",
                                    lineNumber: 78,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/recipe/[id]/page.tsx",
                            lineNumber: 62,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/recipe/[id]/page.tsx",
                    lineNumber: 57,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 md:grid-cols-2 gap-10",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-2xl font-serif font-semibold mb-4",
                                    children: "Ingredients"
                                }, void 0, false, {
                                    fileName: "[project]/app/recipe/[id]/page.tsx",
                                    lineNumber: 87,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                    className: "space-y-3 text-sm",
                                    children: recipe.ingredients.length > 0 ? recipe.ingredients.map((ingredient, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            className: "flex gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-primary",
                                                    children: "•"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/recipe/[id]/page.tsx",
                                                    lineNumber: 92,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: ingredient
                                                }, void 0, false, {
                                                    fileName: "[project]/app/recipe/[id]/page.tsx",
                                                    lineNumber: 93,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, `${ingredient}-${index}`, true, {
                                            fileName: "[project]/app/recipe/[id]/page.tsx",
                                            lineNumber: 91,
                                            columnNumber: 19
                                        }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "text-muted-foreground",
                                        children: "Ingredient details coming soon."
                                    }, void 0, false, {
                                        fileName: "[project]/app/recipe/[id]/page.tsx",
                                        lineNumber: 97,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/recipe/[id]/page.tsx",
                                    lineNumber: 88,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/recipe/[id]/page.tsx",
                            lineNumber: 86,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-2xl font-serif font-semibold mb-4",
                                    children: "Directions"
                                }, void 0, false, {
                                    fileName: "[project]/app/recipe/[id]/page.tsx",
                                    lineNumber: 103,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                                    className: "space-y-4 text-sm",
                                    children: recipe.directions.length > 0 ? recipe.directions.map((step, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            className: "flex gap-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-primary font-semibold",
                                                    children: [
                                                        index + 1,
                                                        "."
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/recipe/[id]/page.tsx",
                                                    lineNumber: 108,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: step
                                                }, void 0, false, {
                                                    fileName: "[project]/app/recipe/[id]/page.tsx",
                                                    lineNumber: 109,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, `${index}-${step.slice(0, 10)}`, true, {
                                            fileName: "[project]/app/recipe/[id]/page.tsx",
                                            lineNumber: 107,
                                            columnNumber: 19
                                        }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "text-muted-foreground",
                                        children: "Directions not available in CSV."
                                    }, void 0, false, {
                                        fileName: "[project]/app/recipe/[id]/page.tsx",
                                        lineNumber: 113,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/recipe/[id]/page.tsx",
                                    lineNumber: 104,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/recipe/[id]/page.tsx",
                            lineNumber: 102,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/recipe/[id]/page.tsx",
                    lineNumber: 85,
                    columnNumber: 9
                }, this),
                recipe.nutrition && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "border border-border rounded-2xl p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-xl font-semibold mb-2",
                            children: "Estimated nutrition"
                        }, void 0, false, {
                            fileName: "[project]/app/recipe/[id]/page.tsx",
                            lineNumber: 121,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-muted-foreground",
                            children: recipe.nutrition
                        }, void 0, false, {
                            fileName: "[project]/app/recipe/[id]/page.tsx",
                            lineNumber: 122,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/recipe/[id]/page.tsx",
                    lineNumber: 120,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/recipe/[id]/page.tsx",
            lineNumber: 46,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/recipe/[id]/page.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
function formatMinutes(value) {
    if (!value) return null;
    if (value < 60) return `${value} mins`;
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    if (minutes === 0) return `${hours} hr${hours > 1 ? "s" : ""}`;
    return `${hours} hr${hours > 1 ? "s" : ""} ${minutes} min`;
}
}),
"[project]/app/recipe/[id]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/recipe/[id]/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__45c29f9c._.js.map