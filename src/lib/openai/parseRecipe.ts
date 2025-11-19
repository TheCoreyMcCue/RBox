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

    // quarts
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

    // ml
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

    // ✅ whole units (intact items)
    whole: "whole",
    wholes: "whole",
    each: "whole",
    item: "whole",
    items: "whole",
    unit: "whole",
    units: "whole",
    count: "whole",
    counts: "whole",
    head: "whole",
    heads: "whole",
    bunch: "whole",
    bunches: "whole",
    stalk: "whole",
    stalks: "whole",
    ear: "whole",
    ears: "whole",

    // cooking descriptors that are more like "sub-pieces"
    clove: "clove",
    cloves: "clove",
    slice: "slice",
    slices: "slice",
    stick: "stick",
    sticks: "stick",

    // “tiny” units
    pinch: "pinch",
    pinches: "pinch",
    dash: "pinch",
    dashes: "pinch",

    // handful
    handful: "handful",
    handfuls: "handful",
  };

  return map[u] ?? "";
}

function normalizeCategories(raw: any): string[] {
  if (!Array.isArray(raw)) return [];

  const cleaned = raw
    .map((c) => String(c).toLowerCase().trim())
    .filter((c) => ALL_CATEGORIES.includes(c));

  // unique
  return Array.from(new Set(cleaned));
}

function stripStepNumbering(step: string): string {
  return step
    .replace(/^\s*\d+[\).\s-]+/, "")
    .replace(/^[-•\s]+/, "")
    .trim();
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
You are a world-class recipe parser. Your ONLY job is to convert ANY recipe text into strictly valid JSON.

Return ONLY valid, minified JSON:

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

RULES:
- Use ONLY this list of allowed categories:
${ALL_CATEGORIES.map((c) => `"${c}"`).join(", ")}
- If none apply, return [] for categories.
- cookTime MUST be an integer number of minutes.
- ingredients.amount must be plain strings ("1", "1/2", "2.5").
- ingredients.unit must be canonical:
  ["tsp","tbsp","cup","ml","l","g","kg","oz","lb","piece","pinch","quart","pint","gallon","fl oz"]
- If a unit is missing, set unit to "".
- DO NOT include numbering in steps ("1.", "2.", "•").
- DO NOT invent ingredients or steps—use ONLY what appears in the recipe.
- DO NOT output any text outside the JSON.
    `.trim();

    const response = await axios.post<RecipeResponse>(
      OPENAI_API_URL,
      {
        model: "gpt-4.1-mini", // more stable than gpt-4-turbo
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: recipeText },
        ],
        temperature: 0.0,
        max_tokens: 1200,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 25000,
      }
    );

    const rawString = response.data.choices?.[0]?.message?.content || "";

    // Extract JSON safely
    const start = rawString.indexOf("{");
    const end = rawString.lastIndexOf("}");
    const jsonString = rawString.slice(start, end + 1);

    // Clean formatting issues
    const cleaned = jsonString
      .replace(/\u201C|\u201D/g, '"') // smart quotes
      .replace(/\u2018|\u2019/g, "'")
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]");

    const raw = JSON.parse(cleaned);

    // ---------- Normalize ingredients ----------
    const ingredients = Array.isArray(raw.ingredients)
      ? raw.ingredients.map((i: any) => ({
          amount: String(i.amount ?? "").trim(),
          unit: normalizeUnit(i.unit),
          name: String(i.name ?? "").trim(),
        }))
      : [];

    // ---------- Normalize steps ----------
    const steps = Array.isArray(raw.steps)
      ? raw.steps.map((s: any) => stripStepNumbering(String(s)))
      : [];

    return {
      title: String(raw.title ?? "").trim(),
      description: String(raw.description ?? "").trim(),
      cookTime: Number(raw.cookTime ?? 0),
      ingredients,
      steps,
      categories: normalizeCategories(raw.categories),
    };
  } catch (err: any) {
    console.error("❌ Error parsing recipe:", err?.response?.data || err);
    return null;
  }
};
