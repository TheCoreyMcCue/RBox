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

// -------------------------------------------------
//                ROBUST SANITIZER
// -------------------------------------------------
function sanitizeRecipeText(input: string): string {
  return (
    input
      // Remove IG/food-blog checkbox bullets (both "▢ 1" and "▢1")
      .replace(/^▢\s*/gm, "")
      .replace(/^▢(?=\d)/gm, "")

      // Remove scaling controls like "1x", "2x", "3x"
      .replace(/^\s*[0-9]+x\s*$/gim, "")

      // Remove US / Metric headers
      .replace(/^\s*(US|Metric)\s*$/gim, "")

      // Remove "ADVERTISING" or similar junk lines
      .replace(/^\s*ADVERTISING\s*$/gim, "")

      // Normalize various dash styles to ASCII hyphen
      .replace(/[–—−]/g, "-")

      // Normalize fractions (common IG/blog characters)
      .replace(/¼/g, "1/4")
      .replace(/½/g, "1/2")
      .replace(/¾/g, "3/4")

      // Fix unit plural mismatch when amount is 1
      .replace(/\b1 tablespoons\b/gi, "1 tablespoon")
      .replace(/\b1 teaspoons\b/gi, "1 teaspoon")
      .replace(/\b1 cups\b/gi, "1 cup")

      // Remove stray bullet characters
      .replace(/^[•*+-]\s*/gm, "")

      // Normalize double spaces and whitespace noise
      .replace(/\r/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
      // Remove zero-width characters
      .replace(/[\u200B-\u200D\uFEFF]/g, "")

      // Normalize non-breaking spaces
      .replace(/\u00A0/g, " ")

      // Remove soft hyphens
      .replace(/\u00AD/g, "")

      // Normalize smart punctuation
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
  );
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

  misc: [
    "sauce",
    "marinade",
    "rub",
    "seasoning",
    "dressing",
    "condiment",
    "spread",
    "dip",
    "syrup",
    "jam",
    "preserve",
  ],
};

const ALL_CATEGORIES: string[] = Object.values(CATEGORY_OPTIONS).flat();

// ---------------- Normalization Utils ----------------
function normalizeUnit(rawUnit: any): string {
  if (!rawUnit) return "";

  const u = String(rawUnit).toLowerCase().trim();

  const map: Record<string, string> = {
    tsp: "tsp",
    tsps: "tsp",
    teaspoon: "tsp",
    teaspoons: "tsp",

    tbsp: "tbsp",
    tbsps: "tbsp",
    tablespoon: "tbsp",
    tablespoons: "tbsp",
    tbl: "tbsp",

    cup: "cup",
    cups: "cup",

    quart: "quart",
    quarts: "quart",
    qt: "quart",
    qts: "quart",

    pint: "pint",
    pints: "pint",
    pt: "pint",
    pts: "pint",

    gallon: "gallon",
    gallons: "gallon",
    gal: "gallon",

    "fl oz": "fl oz",
    "fluid ounce": "fl oz",
    "fluid ounces": "fl oz",

    ml: "ml",
    milliliter: "ml",
    milliliters: "ml",

    l: "l",
    liter: "l",
    liters: "l",

    g: "g",
    gram: "g",
    grams: "g",

    kg: "kg",
    kilogram: "kg",
    kilograms: "kg",

    oz: "oz",
    ounce: "oz",
    ounces: "oz",

    lb: "lb",
    lbs: "lb",
    pound: "lb",
    pounds: "lb",

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

    clove: "clove",
    cloves: "clove",
    slice: "slice",
    slices: "slice",
    stick: "stick",
    sticks: "stick",

    pinch: "pinch",
    pinches: "pinch",
    dash: "pinch",
    dashes: "pinch",

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

  // ⭐ Apply robust sanitizer BEFORE sending to OpenAI
  const cleanedInput = sanitizeRecipeText(recipeText);

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
  ["tsp","tbsp","cup","ml","l","g","kg","oz","lb","pinch","quart","pint","gallon","fl oz","whole"]
- If a unit is missing, set unit to "".
- DO NOT include numbering in steps.
- DO NOT invent ingredients or steps.
- DO NOT output anything outside the JSON.
    `.trim();

    const response = await axios.post<RecipeResponse>(
      OPENAI_API_URL,
      {
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: cleanedInput },
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
