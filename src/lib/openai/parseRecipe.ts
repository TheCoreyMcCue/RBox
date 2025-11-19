// lib/parseRecipe.ts
import axios from "axios";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ---------------- Types ----------------
export interface Ingredient {
  amount: string;
  unit: string;
  name: string;
}

export interface ParsedRecipe {
  title: string;
  description: string;
  cookTime: number;
  ingredients: Ingredient[];
  steps: string[];
  categories: string[];
}

interface RecipeResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
  }[];
}

// -------------- Your canonical categories --------------
export const CATEGORY_OPTIONS = {
  mealTypes: ["breakfast", "brunch", "lunch", "dinner", "snack"],
  dishTypes: [
    "appetizer",
    "dessert",
    "drink",
    "side dish",
    "main course",
    "salad",
    "soup",
  ],
  mainIngredientAndDiet: [
    "beef",
    "chicken",
    "dairy-free",
    "gluten-free",
    "high-protein",
    "keto",
    "low-carb",
    "paleo",
    "plant-based",
    "pork",
    "seafood",
    "vegan",
    "vegetarian",
  ],
  cuisines: [
    "american",
    "asian",
    "chinese",
    "french",
    "indian",
    "italian",
    "japanese",
    "korean",
    "mediterranean",
    "mexican",
    "middle eastern",
    "thai",
  ],
  methods: [
    "air fryer",
    "baked",
    "grilled",
    "instant pot",
    "no-cook",
    "slow cooker",
    "stovetop",
  ],
  occasions: [
    "birthday",
    "christmas",
    "easter",
    "fall",
    "holiday",
    "spring",
    "summer",
    "thanksgiving",
    "winter",
  ],
};

const ALL_CATEGORIES: string[] = Object.values(CATEGORY_OPTIONS).flat();

// ---------------- Normalization Utils ----------------
function normalizeUnit(rawUnit: any): string {
  if (!rawUnit) return "";

  const u = String(rawUnit).toLowerCase().trim();

  const map: Record<string, string> = {
    // teaspoons
    tsp: "tsp",
    tsps: "tsp",
    teaspoon: "tsp",
    teaspoons: "tsp",

    // tablespoons
    tbsp: "tbsp",
    tbsps: "tbsp",
    tablespoon: "tbsp",
    tablespoons: "tbsp",
    tbl: "tbsp",

    // cups
    cup: "cup",
    cups: "cup",

    // quarts & conversion
    quart: "quart",
    quarts: "quart",
    qt: "quart",
    qts: "quart",

    // pints
    pint: "pint",
    pints: "pint",
    pt: "pint",
    pts: "pint",

    // gallons
    gallon: "gallon",
    gallons: "gallon",
    gal: "gallon",

    // fl oz
    "fl oz": "fl oz",
    "fluid ounce": "fl oz",
    "fluid ounces": "fl oz",

    // ml / metric small volume
    ml: "ml",
    milliliter: "ml",
    milliliters: "ml",

    // liters
    l: "l",
    liter: "l",
    liters: "l",

    // grams
    g: "g",
    gram: "g",
    grams: "g",

    // kilograms
    kg: "kg",
    kilogram: "kg",
    kilograms: "kg",

    // ounces
    oz: "oz",
    ounce: "oz",
    ounces: "oz",

    // pounds
    lb: "lb",
    lbs: "lb",
    pound: "lb",
    pounds: "lb",

    // pieces / generic
    piece: "piece",
    pieces: "piece",
    whole: "piece",

    // cooking descriptors mapped to "piece"
    clove: "piece",
    cloves: "piece",
    slice: "piece",
    slices: "piece",
    stick: "piece",
    sticks: "piece",

    // tiny units mapped to pinch (no conversion)
    pinch: "pinch",
    pinches: "pinch",
    dash: "pinch",
    dashes: "pinch",

    // handful
    handful: "piece",
    handfuls: "piece",
  };

  return map[u] ?? u; // fallback (rare)
}

function normalizeCategories(raw: any): string[] {
  if (!Array.isArray(raw)) return [];
  const cleaned = raw
    .map((c) => String(c).toLowerCase().trim())
    .filter((c) => ALL_CATEGORIES.includes(c));

  return Array.from(new Set(cleaned));
}

// ---------------- PARSER ----------------
export const parseRecipe = async (
  recipeText: string
): Promise<ParsedRecipe | null> => {
  if (!OPENAI_API_KEY) {
    console.error("❌ Missing OpenAI key");
    return null;
  }

  try {
    const prompt = `
You extract structured JSON from recipe text.

Return ONLY valid minified JSON:

{
  "title": string,
  "description": string,
  "cookTime": number,
  "ingredients": [
     { "amount": string, "unit": string, "name": string }
  ],
  "steps": [string],
  "categories": [string]
}

Rules:
- cookTime must be an integer number of MINUTES.
- ingredients.amount must stay human-readable ("1", "1/2", "1 1/4").
- ingredients.unit must be canonical:
  ["tsp","tbsp","cup","ml","l","g","kg","oz","lb","piece"]
- If no unit, use "" and keep the ingredient name intact.
- steps must not contain numbering ("1.", "2." etc).
- categories must ONLY be chosen from this list:
${ALL_CATEGORIES.map((c) => `"${c}"`).join(", ")}
- If none apply, return empty array [].

Return STRICT JSON with NO text outside of JSON.
    `.trim();

    const response = await axios.post<RecipeResponse>(
      OPENAI_API_URL,
      {
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: recipeText },
        ],
        temperature: 0.1,
        max_tokens: 900,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    const rawString = response.data.choices?.[0]?.message?.content || "";
    const start = rawString.indexOf("{");
    const end = rawString.lastIndexOf("}");
    const jsonString = rawString.slice(start, end + 1);

    const cleaned = jsonString
      .replace(/\u201C|\u201D/g, '"')
      .replace(/\u2018|\u2019/g, "'")
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]");

    const raw = JSON.parse(cleaned);

    const ingredients = Array.isArray(raw.ingredients)
      ? raw.ingredients.map((i: any) => ({
          amount: String(i.amount ?? "").trim(),
          unit: normalizeUnit(i.unit),
          name: String(i.name ?? "").trim(),
        }))
      : [];

    return {
      title: String(raw.title ?? "").trim(),
      description: String(raw.description ?? "").trim(),
      cookTime: Number(raw.cookTime ?? 0),
      ingredients,
      steps: Array.isArray(raw.steps)
        ? raw.steps.map((s: any) => String(s).trim())
        : [],
      categories: normalizeCategories(raw.categories),
    };
  } catch (err: any) {
    console.error("❌ Error parsing recipe:", err?.response?.data || err);
    return null;
  }
};
